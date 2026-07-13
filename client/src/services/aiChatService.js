import axios from 'axios';
import authService from './authService';

const API = '/api/ai-chat';
const headers = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

const aiChatService = {
  ask: async (message) => {
    const res = await axios.post(`${API}/ask`, { message }, headers());
    return res.data;
  },

  getHistory: async () => {
    const res = await axios.get(`${API}/history`, headers());
    return res.data;
  },
};

export default aiChatService;
