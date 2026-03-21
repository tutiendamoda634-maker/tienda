/**
 * Middleware to verify tenant has an active subscription
 * Must be used AFTER tenantResolver middleware
 *
 * Allows access if:
 * - subscription_status = 'active'
 * - subscription_status = 'trialing' AND trial_ends_at > now
 * - subscription_status = 'past_due' (grace period of 3 days)
 *
 * Returns 402 Payment Required if subscription is inactive
 */
export function requireActiveSubscription(req, res, next) {
  const tenant = req.tenant;

  if (!tenant) {
    return res.status(500).json({
      error: 'Tenant not resolved',
      code: 'TENANT_NOT_RESOLVED'
    });
  }

  const now = new Date();
  const status = tenant.subscription_status;

  // Active subscription - allow access
  if (status === 'active') {
    return next();
  }

  // Trialing - check if trial is still valid
  if (status === 'trialing') {
    const trialEndsAt = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;

    if (trialEndsAt && trialEndsAt > now) {
      req.subscriptionWarning = {
        type: 'trial_ending',
        trialEndsAt: trialEndsAt.toISOString(),
        daysRemaining: Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))
      };
      return next();
    }

    // Trial expired
    return res.status(402).json({
      error: 'Período de prueba expirado',
      code: 'TRIAL_EXPIRED',
      trialEndsAt: trialEndsAt?.toISOString(),
      message: 'Tu período de prueba ha terminado. Activa tu suscripción para continuar.'
    });
  }

  // Past due - allow grace period of 3 days
  if (status === 'past_due') {
    const currentPeriodEnd = tenant.current_period_end
      ? new Date(tenant.current_period_end)
      : null;

    if (currentPeriodEnd) {
      const gracePeriodEnd = new Date(currentPeriodEnd);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

      if (now < gracePeriodEnd) {
        req.subscriptionWarning = {
          type: 'payment_past_due',
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          gracePeriodEnd: gracePeriodEnd.toISOString()
        };
        return next();
      }
    }

    return res.status(402).json({
      error: 'Pago pendiente',
      code: 'PAYMENT_PAST_DUE',
      message: 'Tu pago está vencido. Actualiza tu método de pago para continuar.'
    });
  }

  // Cancelled or pending - deny access
  if (status === 'cancelled') {
    return res.status(402).json({
      error: 'Suscripción cancelada',
      code: 'SUBSCRIPTION_CANCELLED',
      cancelledAt: tenant.cancelled_at?.toISOString(),
      message: 'Tu suscripción está cancelada. Reactívala para continuar.'
    });
  }

  if (status === 'pending') {
    return res.status(402).json({
      error: 'Suscripción pendiente',
      code: 'SUBSCRIPTION_PENDING',
      message: 'Tu suscripción está pendiente de activación. Completa el pago para comenzar.'
    });
  }

  // Unknown status - deny access
  return res.status(402).json({
    error: 'Suscripción inactiva',
    code: 'SUBSCRIPTION_INACTIVE',
    message: 'Tu suscripción no está activa. Contacta soporte si crees que es un error.'
  });
}

/**
 * Optional middleware to add subscription status to response headers
 * Useful for frontend to show warnings before subscription expires
 */
export function addSubscriptionHeaders(req, res, next) {
  const tenant = req.tenant;

  if (tenant) {
    res.setHeader('X-Subscription-Status', tenant.subscription_status || 'unknown');

    if (tenant.trial_ends_at) {
      res.setHeader('X-Trial-Ends-At', tenant.trial_ends_at);
    }

    if (tenant.current_period_end) {
      res.setHeader('X-Period-End', tenant.current_period_end);
    }
  }

  if (req.subscriptionWarning) {
    res.setHeader('X-Subscription-Warning', JSON.stringify(req.subscriptionWarning));
  }

  next();
}
