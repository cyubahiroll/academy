import axios from 'axios';

const API_URL = '/api/auth';

const authService = {
  register: async (data) => {
    const response = await axios.post(`${API_URL}/register`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post(`${API_URL}/login`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  googleLogin: async (accessToken) => {
    const response = await axios.post(`${API_URL}/google`, { access_token: accessToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/change-password`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateEmail: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/email`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getToken: () => localStorage.getItem('token'),

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
