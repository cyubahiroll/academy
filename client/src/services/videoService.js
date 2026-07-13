import axios from 'axios';
import authService from './authService';

const API_URL = '/api/videos';
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const videoService = {
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
  }
};

export default videoService;
