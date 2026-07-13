import axios from 'axios';
import authService from './authService';

const API = '/api/ai-questions';
const headers = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

const aiQuestionService = {
  listDocuments: async () => {
    const res = await axios.get(`${API}/documents`, headers());
    return res.data;
  },

  preview: async (documentId, count = 5) => {
    const res = await axios.post(`${API}/preview`, { documentId, count }, headers());
    return res.data;
  },

  generate: async (documentId, count = 10) => {
    const res = await axios.post(`${API}/generate`, { documentId, count }, headers());
    return res.data;
  },

  save: async (questions) => {
    const res = await axios.post(`${API}/save`, { questions }, headers());
    return res.data;
  },
};

export default aiQuestionService;
