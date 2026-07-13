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
    const token = authService.getToken();
    const response = await fetch(`${API_URL}/${id}/file`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to load document file');
    }
    return response.blob();
  },

  downloadUrl: (id) => `/api/books/${id}/download`,

  download: async (id) => {
    const token = authService.getToken();
    const response = await fetch(`/api/books/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Download failed');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?(.+?)"?$/);
    const filename = match ? match[1] : `document-${id}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    window.URL.revokeObjectURL(url);
  }
};

export default libraryService;
