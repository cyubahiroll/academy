const PAYMENT_CONFIG = {
  momo: {
    apiKey: process.env.MOMO_API_KEY || '',
    apiSecret: process.env.MOMO_API_SECRET || '',
    environment: process.env.MOMO_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.MOMO_ENVIRONMENT === 'production'
      ? 'https://api.mtn.com'
      : 'https://sandbox.momoapi.mtn.com',
    currency: 'UGX'
  },
  airtel: {
    apiKey: process.env.AIRTEL_API_KEY || '',
    baseUrl: 'https://openapi.airtel.africa',
    currency: 'UGX'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    currency: 'usd'
  }
};

const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Premium',
    price: 25000,
    duration: 30,
    currency: 'UGX'
  },
  quarterly: {
    name: 'Quarterly Premium',
    price: 60000,
    duration: 90,
    currency: 'UGX'
  },
  yearly: {
    name: 'Yearly Premium',
    price: 200000,
    duration: 365,
    currency: 'UGX'
  }
};

const EXAM_PRICES = {
  standard: 50000,
  defensive: 35000
};

module.exports = { PAYMENT_CONFIG, SUBSCRIPTION_PLANS, EXAM_PRICES };
