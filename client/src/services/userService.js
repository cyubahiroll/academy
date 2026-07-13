import axios from 'axios';
import authService from './authService';

const API_URL = '/api/users';
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const userService = {
  getAll: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, getHeaders());
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getHeaders());
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await axios.put(`${API_URL}/${id}/toggle-status`, {}, getHeaders());
    return response.data;
  },

  updateRole: async (id, role) => {
    const response = await axios.put(`${API_URL}/${id}/role`, { role }, getHeaders());
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
  },
};

export default userService;
