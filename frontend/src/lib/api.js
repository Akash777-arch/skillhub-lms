import axios from 'axios';

const baseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api/v1' 
  : '/api/v1'; // Uses Vercel proxy rewrite in production

const api = axios.create({
  baseURL,
  withCredentials: true, // Important for cookies
});

// Fetch and attach CSRF token before state-changing requests
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    try {
      const response = await axios.get(`${baseURL}/auth/csrf-token`, { withCredentials: true });
      config.headers['CSRF-Token'] = response.data.csrfToken;
    } catch (err) {
      console.error('Failed to fetch CSRF token', err);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
