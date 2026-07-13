import axios from 'axios';
import authService from './authService';

const BASE = '/api/ai';
const headers = () => ({ headers: { Authorization: `Bearer ${authService.getToken()}` } });

const aiAnswerService = {
  solveQuestion: async (questionData) => {
    const res = await axios.post(`${BASE}/solve`, questionData, headers());
    return res.data;
  },

  answerQuestions: async (questions) => {
    const res = await axios.post(`${BASE}/answer`, { questions }, headers());
    return res.data?.answers || [];
  },
};

export default aiAnswerService;
