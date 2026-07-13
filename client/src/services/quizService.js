import axios from 'axios';
import authService from './authService';

const API_URL = '/api/quizzes';
const getHeaders = () => ({
  headers: { Authorization: `Bearer ${authService.getToken()}` }
});

const quizService = {
  getAll: async (isFree = null) => {
    const params = isFree !== null ? `?is_free=${isFree}` : '';
    const response = await axios.get(`${API_URL}${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  start: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/start`, {}, getHeaders());
    return response.data;
  },

  submit: async (id, answers, timeTaken) => {
    const response = await axios.post(`${API_URL}/${id}/submit`,
      { answers, time_taken: timeTaken }, getHeaders());
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data, getHeaders());
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getHeaders());
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
  }
};

export default quizService;
