import { getCorePool } from '../../config/coreDb.js';
import { getSubscription, mapMPStatus } from '../../services/mercadopago.service.js';
import {
  provisionTenantDatabase,
  updateTenantCredentials,
  createTenantAdminUser
} from '../../services/tenantProvisioning.service.js';

/**
 * Handle MercadoPago webhook notifications
 * POST /api/webhooks/mercadopago
 *
 * MercadoPago sends notifications for:
 * - preapproval: subscription created/updated
 * - authorized_payment: payment received
 * - subscription_preapproval: status changes
 */
export async function handleMercadoPagoWebhook(req, res) {
  // Always respond 200 quickly to MP
  res.status(200).send('OK');

  const { type, data, action } = req.body;

  console.log('MercadoPago webhook received:', { type, action, data });

  // Only process subscription-related events
  if (!['preapproval', 'subscription_preapproval', 'subscription_authorized_payment'].includes(type)) {
    console.log('Ignoring non-subscription event:', type);
    return;
  }

  const preapprovalId = data?.id;
  if (!preapprovalId) {
    console.log('No preapproval ID in webhook');
    return;
  }

  const corePool = getCorePool();

  try {
    // Get subscription details from MercadoPago
    const mpSubscription = await getSubscription(preapprovalId);
    console.log('MP Subscription data:', mpSubscription);

    const tenantSlug = mpSubscription.externalReference;
    if (!tenantSlug) {
      console.log('No external_reference (tenant slug) in subscription');
      return;
    }

    // Find tenant by slug
    const [tenants] = await corePool.query(
      'SELECT * FROM tenants WHERE slug = ?',
      [tenantSlug]
    );

    if (tenants.length === 0) {
      console.log('Tenant not found for slug:', tenantSlug);
      return;
    }

    const tenant = tenants[0];

    // Log the event
    await corePool.query(
      `INSERT INTO subscription_events (tenant_id, event_type, mp_id, raw_payload)
       VALUES (?, ?, ?, ?)`,
      [tenant.id, `mp_${type}_${action || mpSubscription.status}`, preapprovalId, JSON.stringify(req.body)]
    );

    // Map MP status to our internal status
    const newStatus = mapMPStatus(mpSubscription.status);
    const oldStatus = tenant.subscription_status;

    console.log(`Tenant ${tenantSlug}: status ${oldStatus} -> ${newStatus}`);

    // Handle status transitions
    if (newStatus === 'active' && oldStatus !== 'active') {
      // Subscription became active - provision database if needed
      await activateTenant(tenant, corePool);
    }

    // Update subscription status in database
    const nextPaymentDate = mpSubscription.nextPaymentDate
      ? new Date(mpSubscription.nextPaymentDate)
      : null;

    await corePool.query(
      `UPDATE tenants SET
        subscription_status = ?,
        current_period_end = ?,
        payer_email = COALESCE(payer_email, ?)
       WHERE id = ?`,
      [newStatus, nextPaymentDate, mpSubscription.payerEmail, tenant.id]
    );

    console.log(`Tenant ${tenantSlug} updated to status: ${newStatus}`);

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Don't throw - we already responded 200
  }
}

/**
 * Activate a tenant - provision tables and create admin user
 */
async function activateTenant(tenant, corePool) {
  // Skip if already has database/tables configured
  if (tenant.db_name && tenant.db_host) {
    console.log(`Tenant ${tenant.slug} already has tables, updating status only`);
    await corePool.query(
      "UPDATE tenants SET status = 'active' WHERE id = ?",
      [tenant.id]
    );
    return;
  }

  console.log(`Provisioning tables for tenant ${tenant.slug}...`);

  try {
    // Provision the tenant tables with prefix (single DB mode)
    const dbCredentials = await provisionTenantDatabase(tenant);

    // Update tenant with credentials/prefix
    await updateTenantCredentials(tenant.id, dbCredentials);

    // Get user info to create admin in tenant tables
    const [tenantUsers] = await corePool.query(
      `SELECT u.* FROM users u
       JOIN tenant_users tu ON u.id = tu.user_id
       WHERE tu.tenant_id = ? AND tu.role = 'OWNER'`,
      [tenant.id]
    );

    if (tenantUsers.length > 0) {
      const owner = tenantUsers[0];

      // Create admin user in tenant's prefixed tables
      await createTenantAdminUser(corePool, dbCredentials.tablePrefix, {
        name: owner.name,
        email: owner.email,
        passwordHash: owner.password_hash
      });
      console.log(`Created admin user for tenant ${tenant.slug}`);
    }

    console.log(`Tables provisioned successfully for tenant ${tenant.slug} (prefix: ${dbCredentials.tablePrefix}_)`);

  } catch (error) {
    console.error(`Error provisioning tenant ${tenant.slug}:`, error);
    throw error;
  }
}

/**
 * Verify webhook signature (optional but recommended)
 * MercadoPago can send a signature in headers for verification
 */
export function verifyWebhookSignature(req, res, next) {
  // For now, accept all webhooks
  // In production, verify the x-signature header with your webhook secret
  // See: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks

  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];

  if (process.env.MP_WEBHOOK_SECRET && signature) {
    // TODO: Implement signature verification
    // const crypto = require('crypto');
    // const [ts, v1] = signature.split(',').map(s => s.split('=')[1]);
    // const manifest = `id:${req.body.data?.id};request-id:${requestId};ts:${ts};`;
    // const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET);
    // hmac.update(manifest);
    // if (hmac.digest('hex') !== v1) {
    //   return res.status(401).send('Invalid signature');
    // }
  }

  next();
}
