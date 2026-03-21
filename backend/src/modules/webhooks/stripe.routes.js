import { Router } from 'express';
import express from 'express';
import { getCorePool } from '../../config/coreDb.js';
import {
  handleStripeWebhook,
  mapStripeStatus,
  isStripeConfigured
} from '../../services/stripe.service.js';
import {
  provisionTenantDatabase,
  updateTenantCredentials,
  createTenantAdminUser
} from '../../services/tenantProvisioning.service.js';

const router = Router();

/**
 * Stripe webhook endpoint
 * POST /api/webhooks/stripe
 */
router.post(
  '/stripe',
  // Stripe requires raw body for signature verification
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!isStripeConfigured()) {
      return res.status(400).send('Stripe not configured');
    }

    const signature = req.headers['stripe-signature'];

    try {
      const { event, tenantSlug, subscriptionId } = await handleStripeWebhook(
        req.body,
        signature
      );

      console.log('Stripe webhook received:', event.type, tenantSlug);

      // Respond to Stripe immediately
      res.status(200).json({ received: true });

      // Process the event
      await processStripeEvent(event, tenantSlug, subscriptionId);

    } catch (err) {
      console.error('Stripe webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

/**
 * Process Stripe events
 */
async function processStripeEvent(event, tenantSlug, subscriptionId) {
  if (!tenantSlug) {
    console.log('No tenant slug in event, skipping');
    return;
  }

  const corePool = getCorePool();

  // Find tenant
  const [tenants] = await corePool.query(
    'SELECT * FROM tenants WHERE slug = ?',
    [tenantSlug]
  );

  if (tenants.length === 0) {
    console.log('Tenant not found:', tenantSlug);
    return;
  }

  const tenant = tenants[0];

  // Log the event
  await corePool.query(
    `INSERT INTO subscription_events (tenant_id, event_type, mp_id, raw_payload)
     VALUES (?, ?, ?, ?)`,
    [tenant.id, `stripe_${event.type}`, subscriptionId, JSON.stringify(event.data)]
  );

  // Handle specific events
  switch (event.type) {
    case 'checkout.session.completed':
      // Subscription created and paid
      await handleSubscriptionCreated(tenant, event.data, corePool);
      break;

    case 'customer.subscription.updated':
      // Subscription status changed
      await handleSubscriptionUpdated(tenant, event.data, corePool);
      break;

    case 'customer.subscription.deleted':
      // Subscription cancelled
      await handleSubscriptionCancelled(tenant, corePool);
      break;

    case 'invoice.payment_failed':
      // Payment failed
      await handlePaymentFailed(tenant, corePool);
      break;

    case 'invoice.paid':
      // Payment succeeded
      await handlePaymentSucceeded(tenant, event.data, corePool);
      break;

    default:
      console.log('Unhandled Stripe event:', event.type);
  }
}

/**
 * Handle new subscription created
 */
async function handleSubscriptionCreated(tenant, sessionData, corePool) {
  const subscriptionId = sessionData.subscription;
  const customerId = sessionData.customer;

  // Update tenant with Stripe IDs
  await corePool.query(
    `UPDATE tenants SET
      preapproval_id = ?,
      subscription_status = 'active',
      status = 'active'
     WHERE id = ?`,
    [subscriptionId, tenant.id]
  );

  // Provision tables if not already done
  if (!tenant.db_name) {
    try {
      // Provision tenant tables with prefix (single DB mode)
      const dbCredentials = await provisionTenantDatabase(tenant);
      await updateTenantCredentials(tenant.id, dbCredentials);

      // Get owner user to create in tenant tables
      const [users] = await corePool.query(
        `SELECT u.* FROM users u
         JOIN tenant_users tu ON u.id = tu.user_id
         WHERE tu.tenant_id = ? AND tu.role = 'OWNER'`,
        [tenant.id]
      );

      if (users.length > 0) {
        const owner = users[0];
        // Create admin user in tenant's prefixed tables
        await createTenantAdminUser(corePool, dbCredentials.tablePrefix, {
          name: owner.name,
          email: owner.email,
          passwordHash: owner.password_hash
        });
      }

      console.log(`✅ Tables provisioned for tenant ${tenant.slug} after Stripe payment (prefix: ${dbCredentials.tablePrefix}_)`);
    } catch (err) {
      console.error('Error provisioning tables:', err);
    }
  }

  console.log(`✅ Tenant ${tenant.slug} subscription activated via Stripe`);
}

/**
 * Handle subscription status update
 */
async function handleSubscriptionUpdated(tenant, subscriptionData, corePool) {
  const newStatus = mapStripeStatus(subscriptionData.status);
  const currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000);

  await corePool.query(
    `UPDATE tenants SET
      subscription_status = ?,
      current_period_end = ?
     WHERE id = ?`,
    [newStatus, currentPeriodEnd, tenant.id]
  );

  console.log(`Tenant ${tenant.slug} subscription updated to: ${newStatus}`);
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(tenant, corePool) {
  await corePool.query(
    `UPDATE tenants SET
      subscription_status = 'cancelled',
      cancelled_at = NOW()
     WHERE id = ?`,
    [tenant.id]
  );

  console.log(`Tenant ${tenant.slug} subscription cancelled`);
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(tenant, corePool) {
  await corePool.query(
    `UPDATE tenants SET subscription_status = 'past_due' WHERE id = ?`,
    [tenant.id]
  );

  // TODO: Send payment failed email

  console.log(`Tenant ${tenant.slug} payment failed - marked as past_due`);
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(tenant, invoiceData, corePool) {
  const periodEnd = invoiceData.lines?.data?.[0]?.period?.end;

  await corePool.query(
    `UPDATE tenants SET
      subscription_status = 'active',
      current_period_end = ?
     WHERE id = ?`,
    [periodEnd ? new Date(periodEnd * 1000) : null, tenant.id]
  );

  console.log(`Tenant ${tenant.slug} payment succeeded`);
}

export default router;
