import axios from 'axios';
import authService from './authService';

const API_URL = '/api/library';
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const libraryService = {
  getAll: async (isFree = null) => {
    const params = isFree !== null ? `?is_free=${isFree}` : '';
    const response = await axios.get(`${API_URL}${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${authService.getToken()}` }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
  },

  read: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/read`);
    return response.data;
  },

  readFileUrl: (id) => `${API_URL}/${id}/read-file`,

  getReadingProgress: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/reading-progress`, getHeaders());
    return response.data;
  },

  saveReadingProgress: async (id, data) => {
    const response = await axios.post(`${API_URL}/${id}/reading-progress`, data, getHeaders());
    return response.data;
  },

  checkAccess: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/access`, getHeaders());
    return response.data;
  },

  purchase: async (id, data) => {
    const response = await axios.post(`${API_URL}/${id}/purchase`, data, getHeaders());
    return response.data;
  },

  verifyPayment: async (id, transactionReference) => {
    const response = await axios.post(`${API_URL}/${id}/verify-payment`, { transaction_reference: transactionReference }, getHeaders());
    return response.data;
  },

  getDocumentFile: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/file`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` },
      responseType: 'blob'
    });
    return response.data;
  },

  downloadUrl: (id) => `${API_URL}/${id}/download`,

  download: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/download`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` },
      responseType: 'blob'
    });
    const blob = response.data;
    const disposition = response.headers?.['content-disposition'];
    const match = disposition?.match(/filename="?(.+?)"?$/);
    const filename = match ? match[1] : `document-${id}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }
};

export default libraryService;
