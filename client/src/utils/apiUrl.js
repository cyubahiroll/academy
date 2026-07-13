const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => {
  if (!path) return '';
  return `${API_BASE}${path}`;
};

export default apiUrl;
