import axios from 'axios';
import authService from './authService';

const API_URL = '/api/payments';
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const paymentService = {
  create: async (data) => {
    const response = await axios.post(API_URL, data, getHeaders());
    return response.data;
  },

  confirm: async (paymentId, transactionId) => {
    const response = await axios.put(`${API_URL}/confirm`,
      { payment_id: paymentId, transaction_id: transactionId }, getHeaders());
    return response.data;
  },

  getHistory: async () => {
    const response = await axios.get(`${API_URL}/history`, getHeaders());
    return response.data;
  },

  getSubscription: async () => {
    const response = await axios.get(`${API_URL}/subscription`, getHeaders());
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await axios.put(`${API_URL}/subscription/cancel`, {}, getHeaders());
    return response.data;
  },

  requestBookPayment: async (data) => {
    const response = await axios.post(`${API_URL}/request`, data, getHeaders());
    return response.data;
  },

  checkBookPaymentStatus: async (referenceId) => {
    const response = await axios.get(`${API_URL}/status/${referenceId}`, getHeaders());
    return response.data;
  }
};

export default paymentService;
