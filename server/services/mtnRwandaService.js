const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.MTN_API_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY || '';
const API_USER = process.env.MTN_API_USER || '';
const API_KEY = process.env.MTN_API_KEY || '';
const TARGET_ENV = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';
const CURRENCY = 'RWF';
const PARTY_ID_TYPE = 'MSISDN';

function generateUUID() {
  return crypto.randomUUID();
}

let cachedToken = null;
let tokenExpiry = null;

async function getToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!API_USER || !API_KEY) {
    throw new Error('MTN API credentials not configured. Set MTN_API_USER and MTN_API_KEY in .env');
  }

  const auth = Buffer.from(`${API_USER}:${API_KEY}`).toString('base64');

  const response = await axios.post(`${BASE_URL}/collection/token/`, null, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
    }
  });

  cachedToken = response.data.access_token;
  tokenExpiry = Date.now() + (parseInt(response.data.expires_in) - 60) * 1000;
  return cachedToken;
}

exports.requestToPay = async ({ phoneNumber, amount, externalId }) => {
  const token = await getToken();
  const referenceId = generateUUID();
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;

  const payload = {
    amount: String(amount),
    currency: CURRENCY,
    externalId: externalId || referenceId,
    payer: {
      partyIdType: PARTY_ID_TYPE,
      partyId: formattedPhone
    },
    payerMessage: 'Book purchase - Road Rules Academy',
    payeeNote: 'Payment for book download'
  };

  await axios.post(`${BASE_URL}/collection/v1_0/requesttopay`, payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': TARGET_ENV,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });

  return { referenceId };
};

exports.getPaymentStatus = async (referenceId) => {
  const token = await getToken();

  try {
    const response = await axios.get(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'X-Target-Environment': TARGET_ENV,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    return {
      status: response.data.status,
      financialTransactionId: response.data.financialTransactionId || null,
      amount: response.data.amount,
      currency: response.data.currency,
      externalId: response.data.externalId,
      payerPartyId: response.data.payer?.partyId
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { status: 'PENDING', financialTransactionId: null };
    }
    throw error;
  }
};

exports.sendDeliveryNotification = async (referenceId) => {
  const token = await getToken();

  await axios.post(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}/deliverynotification`,
    { notificationMessage: 'Payment received successfully. Your Road Rules Academy book download is now available.' },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': TARGET_ENV,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
};
