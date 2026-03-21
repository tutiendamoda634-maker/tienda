import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const preApproval = new PreApproval(client);

/**
 * Create a subscription (preapproval) in MercadoPago
 * @param {Object} params
 * @param {string} params.email - Payer email
 * @param {string} params.tenantSlug - Unique tenant identifier for external_reference
 * @param {number} params.amount - Monthly amount (default from env or 20)
 * @returns {Promise<{preapprovalId: string, initPoint: string}>}
 */
export async function createSubscription({ email, tenantSlug, amount }) {
  const subscriptionAmount = amount || parseFloat(process.env.MP_PLAN_AMOUNT) || 20;

  const body = {
    reason: `Suscripción CloudShop - ${tenantSlug}`,
    external_reference: tenantSlug,
    payer_email: email,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: subscriptionAmount,
      currency_id: 'ARS' // Change to your currency: MXN, COP, CLP, etc.
    },
    back_url: process.env.MP_BACK_URL || 'https://tudominio.com/panel',
    status: 'pending'
  };

  try {
    const response = await preApproval.create({ body });

    return {
      preapprovalId: response.id,
      initPoint: response.init_point,
      status: response.status
    };
  } catch (error) {
    console.error('MercadoPago createSubscription error:', error);
    throw new Error(`Error creating subscription: ${error.message}`);
  }
}

/**
 * Get subscription status from MercadoPago
 * @param {string} preapprovalId - The preapproval ID
 * @returns {Promise<Object>} Subscription data
 */
export async function getSubscription(preapprovalId) {
  try {
    const response = await preApproval.get({ id: preapprovalId });

    return {
      id: response.id,
      status: response.status,
      payerEmail: response.payer_email,
      reason: response.reason,
      externalReference: response.external_reference,
      nextPaymentDate: response.next_payment_date,
      autoRecurring: response.auto_recurring
    };
  } catch (error) {
    console.error('MercadoPago getSubscription error:', error);
    throw new Error(`Error getting subscription: ${error.message}`);
  }
}

/**
 * Cancel a subscription in MercadoPago
 * @param {string} preapprovalId - The preapproval ID
 * @returns {Promise<Object>} Updated subscription data
 */
export async function cancelSubscription(preapprovalId) {
  try {
    const response = await preApproval.update({
      id: preapprovalId,
      body: { status: 'cancelled' }
    });

    return {
      id: response.id,
      status: response.status,
      cancelled: true
    };
  } catch (error) {
    console.error('MercadoPago cancelSubscription error:', error);
    throw new Error(`Error cancelling subscription: ${error.message}`);
  }
}

/**
 * Map MercadoPago status to internal subscription status
 * @param {string} mpStatus - MercadoPago preapproval status
 * @returns {string} Internal status
 */
export function mapMPStatus(mpStatus) {
  const statusMap = {
    'pending': 'pending',
    'authorized': 'active',
    'paused': 'past_due',
    'cancelled': 'cancelled'
  };
  return statusMap[mpStatus] || 'pending';
}
