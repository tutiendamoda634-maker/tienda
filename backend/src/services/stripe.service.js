/**
 * Stripe Service
 *
 * Alternative payment provider to MercadoPago
 * Supports subscriptions with Stripe Billing
 */

// Import will fail if stripe not installed - that's ok
let stripe = null;
try {
  const Stripe = (await import('stripe')).default;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('Stripe SDK not available');
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!stripe && !!process.env.STRIPE_PRICE_ID;
}

/**
 * Create a Stripe Checkout Session for subscription
 * @param {Object} params
 * @param {string} params.email - Customer email
 * @param {string} params.tenantSlug - Tenant identifier
 * @param {string} params.successUrl - URL after successful payment
 * @param {string} params.cancelUrl - URL if payment cancelled
 */
export async function createCheckoutSession({ email, tenantSlug, successUrl, cancelUrl }) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error('STRIPE_PRICE_ID not configured');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    metadata: {
      tenant_slug: tenantSlug
    },
    subscription_data: {
      metadata: {
        tenant_slug: tenantSlug
      },
      trial_period_days: parseInt(process.env.TRIAL_DAYS) || 7
    },
    success_url: successUrl || `${process.env.FRONTEND_URL}/panel?success=true`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/registro?cancelled=true`
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    customerId: session.customer
  };
}

/**
 * Get subscription by ID
 */
export async function getStripeSubscription(subscriptionId) {
  if (!stripe) throw new Error('Stripe not configured');

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return {
    id: subscription.id,
    status: mapStripeStatus(subscription.status),
    customerId: subscription.customer,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: subscription.metadata
  };
}

/**
 * Cancel subscription
 */
export async function cancelStripeSubscription(subscriptionId, immediately = false) {
  if (!stripe) throw new Error('Stripe not configured');

  if (immediately) {
    await stripe.subscriptions.cancel(subscriptionId);
  } else {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  }

  return { cancelled: true };
}

/**
 * Create a Customer Portal session
 * Allows customer to manage their subscription
 */
export async function createPortalSession({ customerId, returnUrl }) {
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return {
    portalUrl: session.url
  };
}

/**
 * Handle Stripe webhook event
 */
export async function handleStripeWebhook(payload, signature) {
  if (!stripe) throw new Error('Stripe not configured');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (webhookSecret) {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } else {
    event = JSON.parse(payload);
  }

  const eventData = {
    type: event.type,
    data: event.data.object
  };

  // Extract tenant slug from metadata
  let tenantSlug = null;
  if (event.data.object.metadata?.tenant_slug) {
    tenantSlug = event.data.object.metadata.tenant_slug;
  } else if (event.data.object.subscription) {
    // For payment events, we need to fetch the subscription
    const subscription = await stripe.subscriptions.retrieve(event.data.object.subscription);
    tenantSlug = subscription.metadata?.tenant_slug;
  }

  return {
    event: eventData,
    tenantSlug,
    subscriptionId: event.data.object.subscription || event.data.object.id
  };
}

/**
 * Map Stripe subscription status to internal status
 */
export function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'trialing': 'trialing',
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'unpaid': 'past_due',
    'incomplete': 'pending',
    'incomplete_expired': 'cancelled',
    'paused': 'past_due'
  };

  return statusMap[stripeStatus] || 'pending';
}

/**
 * Create or get Stripe Price for the subscription
 * Used during setup to create the product and price
 */
export async function setupStripeProduct() {
  if (!stripe) throw new Error('Stripe not configured');

  const productName = 'CloudShop PRO';
  const priceAmount = parseInt(process.env.SUBSCRIPTION_PRICE) || 2000; // in cents

  // Check if product exists
  const products = await stripe.products.list({ limit: 1, active: true });
  let product = products.data.find(p => p.name === productName);

  if (!product) {
    product = await stripe.products.create({
      name: productName,
      description: 'Acceso completo a CloudShop - Sistema de gestión para tiendas de ropa'
    });
  }

  // Check if price exists
  const prices = await stripe.prices.list({ product: product.id, active: true });
  let price = prices.data.find(p =>
    p.unit_amount === priceAmount &&
    p.recurring?.interval === 'month'
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceAmount,
      currency: process.env.STRIPE_CURRENCY || 'usd',
      recurring: {
        interval: 'month'
      }
    });
  }

  return {
    productId: product.id,
    priceId: price.id,
    amount: priceAmount / 100,
    currency: price.currency
  };
}
