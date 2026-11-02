import axios from 'axios';
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
});
let csrf = '';
export const setCsrf = (x) => (csrf = x);
api.interceptors.request.use((c) => {
  if (csrf) c.headers['x-csrf-token'] = csrf;
  return c;
});
