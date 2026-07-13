import axios from 'axios';
import authService from './authService';

const API = '/api/free-test';
const headers = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

const freeTestService = {
  start: async () => {
    const res = await axios.post(`${API}/start`, {}, headers());
    return res.data;
  },

  submit: async (attemptId, answers) => {
    const res = await axios.post(`${API}/submit`, { attemptId, answers }, headers());
    return res.data;
  },

  history: async () => {
    const res = await axios.get(`${API}/history`, headers());
    return res.data;
  }
};

export default freeTestService;
