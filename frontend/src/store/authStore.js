import { create } from 'zustand';
import client from '../api/client.js';

const setAuthHeader = (token) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  setAuth: ({ user, accessToken }) => {
    setAuthHeader(accessToken);
    set({ user, accessToken });
  },
  logout: () => {
    setAuthHeader(null);
    set({ user: null, accessToken: null });
  },
  login: async (payload) => {
    const { data } = await client.post('/api/auth/login', payload);
    setAuthHeader(data.accessToken);
    set({ user: data.user, accessToken: data.accessToken });
    return data;
  },
  register: async (payload) => client.post('/api/auth/register', payload),
}));

