const axios = require('axios');
const { PAYMENT_CONFIG } = require('../config/payment');

const verifyMomoPayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_CONFIG.momo.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          'X-Reference-Id': transactionId,
          'Ocp-Apim-Subscription-Key': PAYMENT_CONFIG.momo.apiKey,
          'Authorization': `Bearer ${PAYMENT_CONFIG.momo.apiSecret}`
        }
      }
    );
    return {
      success: response.data.status === 'SUCCESSFUL',
      status: response.data.status,
      data: response.data
    };
  } catch (error) {
    console.error('MoMo verification failed:', error.message);
    return { success: false, status: 'FAILED', data: null };
  }
};

const verifyAirtelPayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_CONFIG.airtel.baseUrl}/standard/v1/payments/${transactionId}`,
      {
        headers: {
          'X-Request-Id': transactionId,
          'X-Key': PAYMENT_CONFIG.airtel.apiKey
        }
      }
    );
    return {
      success: response.data.status === 'SUCCESS',
      status: response.data.status,
      data: response.data
    };
  } catch (error) {
    console.error('Airtel verification failed:', error.message);
    return { success: false, status: 'FAILED', data: null };
  }
};

const verifyStripePayment = async (paymentIntentId) => {
  try {
    const stripe = require('stripe')(PAYMENT_CONFIG.stripe.secretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      data: paymentIntent
    };
  } catch (error) {
    console.error('Stripe verification failed:', error.message);
    return { success: false, status: 'FAILED', data: null };
  }
};

const verifyPayment = async (method, transactionId) => {
  switch (method) {
    case 'mtn_momo':
      return verifyMomoPayment(transactionId);
    case 'airtel_money':
      return verifyAirtelPayment(transactionId);
    case 'visa':
    case 'mastercard':
      return verifyStripePayment(transactionId);
    default:
      return { success: false, status: 'UNKNOWN_METHOD', data: null };
  }
};

module.exports = { verifyPayment, verifyMomoPayment, verifyAirtelPayment, verifyStripePayment };
