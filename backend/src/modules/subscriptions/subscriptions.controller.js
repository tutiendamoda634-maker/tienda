import { getCorePool } from '../../config/coreDb.js';
import {
  getSubscription,
  cancelSubscription as mpCancelSubscription
} from '../../services/mercadopago.service.js';

/**
 * Get subscription status for a tenant
 * GET /api/subscription/status
 * Requires tenant slug in query or header
 */
export async function getSubscriptionStatus(req, res) {
  const slug = req.query.slug || req.headers['x-tenant'];

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug requerido' });
  }

  const corePool = getCorePool();

  try {
    const [tenants] = await corePool.query(
      `SELECT id, name, slug, status, subscription_status, preapproval_id,
              payer_email, current_period_end, trial_ends_at, cancelled_at
       FROM tenants WHERE slug = ?`,
      [slug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    const tenant = tenants[0];

    // Try to get fresh status from MercadoPago if we have a preapproval_id
    let mpStatus = null;
    if (tenant.preapproval_id) {
      try {
        mpStatus = await getSubscription(tenant.preapproval_id);
      } catch (mpError) {
        console.error('Error fetching MP subscription:', mpError);
      }
    }

    // Calculate if trial is expired
    const now = new Date();
    const trialExpired = tenant.trial_ends_at && new Date(tenant.trial_ends_at) < now;
    const isActive = tenant.subscription_status === 'active' ||
                     (tenant.subscription_status === 'trialing' && !trialExpired);

    res.json({
      tenantId: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      subscription: {
        status: tenant.subscription_status,
        isActive,
        trialEndsAt: tenant.trial_ends_at,
        trialExpired,
        currentPeriodEnd: tenant.current_period_end,
        cancelledAt: tenant.cancelled_at,
        payerEmail: tenant.payer_email
      },
      mercadopago: mpStatus
    });

  } catch (error) {
    console.error('getSubscriptionStatus error:', error);
    res.status(500).json({ error: 'Error al obtener estado de suscripción' });
  }
}

/**
 * Cancel subscription
 * POST /api/subscription/cancel
 */
export async function cancelSubscription(req, res) {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug requerido' });
  }

  const corePool = getCorePool();

  try {
    const [tenants] = await corePool.query(
      'SELECT id, preapproval_id, subscription_status FROM tenants WHERE slug = ?',
      [slug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    const tenant = tenants[0];

    if (tenant.subscription_status === 'cancelled') {
      return res.status(400).json({ error: 'La suscripción ya está cancelada' });
    }

    // Cancel in MercadoPago if there's a preapproval
    if (tenant.preapproval_id) {
      try {
        await mpCancelSubscription(tenant.preapproval_id);
      } catch (mpError) {
        console.error('Error cancelling MP subscription:', mpError);
        // Continue anyway to update local status
      }
    }

    // Update local status
    const cancelledAt = new Date();
    await corePool.query(
      `UPDATE tenants SET subscription_status = 'cancelled', cancelled_at = ? WHERE id = ?`,
      [cancelledAt, tenant.id]
    );

    // Log the event
    await corePool.query(
      `INSERT INTO subscription_events (tenant_id, event_type, mp_id)
       VALUES (?, ?, ?)`,
      [tenant.id, 'subscription_cancelled', tenant.preapproval_id]
    );

    res.json({
      success: true,
      message: 'Suscripción cancelada',
      cancelledAt: cancelledAt.toISOString()
    });

  } catch (error) {
    console.error('cancelSubscription error:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
}

/**
 * Reactivate subscription (redirect to new checkout)
 * POST /api/subscription/reactivate
 */
export async function reactivateSubscription(req, res) {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug requerido' });
  }

  const corePool = getCorePool();

  try {
    const [tenants] = await corePool.query(
      'SELECT id, payer_email, subscription_status FROM tenants WHERE slug = ?',
      [slug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    const tenant = tenants[0];

    // Import createSubscription here to create new preapproval
    const { createSubscription } = await import('../../services/mercadopago.service.js');

    const mpResult = await createSubscription({
      email: tenant.payer_email,
      tenantSlug: slug
    });

    // Update tenant with new preapproval ID
    await corePool.query(
      `UPDATE tenants SET preapproval_id = ?, subscription_status = 'pending' WHERE id = ?`,
      [mpResult.preapprovalId, tenant.id]
    );

    res.json({
      success: true,
      checkoutUrl: mpResult.initPoint,
      message: 'Redirige al usuario a MercadoPago para completar el pago'
    });

  } catch (error) {
    console.error('reactivateSubscription error:', error);
    res.status(500).json({ error: 'Error al reactivar suscripción' });
  }
}
