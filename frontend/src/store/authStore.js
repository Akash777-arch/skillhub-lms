import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  isAuthModalOpen: false,
  authModalMode: 'login',
  authModalRole: 'student',

  openAuthModal: (mode, role = 'student') => set({ isAuthModalOpen: true, authModalMode: mode, authModalRole: role, error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authModalMode: 'login', authModalRole: 'student', error: null }),

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ 
        error: err.response?.data?.message || err.message || 'Registration failed', 
        isLoading: false 
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (err) {
      console.error('Logout error', err);
    }
  },

  clearError: () => set({ error: null })
}));
