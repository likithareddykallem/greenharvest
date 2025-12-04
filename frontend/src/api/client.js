import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL,
  withCredentials: true,
});

export const setAuthHeader = (token) => {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete client.defaults.headers.common.Authorization;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.url?.includes('/api/auth/refresh')
    ) {
      original._retry = true;
      try {
        const refreshResp = await client.post('/api/auth/refresh');
        const newToken = refreshResp.data?.accessToken;
        if (newToken) setAuthHeader(newToken);
        return client(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
