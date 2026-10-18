import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(`Welcome back, ${data.user.name}.`);
          return { success: true, role: data.user.role };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Could not sign you in. Please try again.');
          return { success: false };
        }
      },

      googleLogin: async () => {
        set({ loading: true });

        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });

          const result = await signInWithPopup(auth, provider);

          if (!result.user.email) {
            throw new Error('Google account email was not returned');
          }

          const { data } = await api.post('/auth/google', {
            name: result.user.displayName || 'User',
            email: result.user.email,
            avatar: result.user.photoURL || '',
          });

          set({
            user: data.user,
            token: data.token,
            loading: false
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(`Welcome ${data.user.name || 'User'}`);

          return {
            success: true,
            role: data.user.role
          };
        } catch (err) {
          set({ loading: false });

          toast.error(err.response?.data?.message || err.message || 'Google sign in failed');

          return { success: false };
        }

      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success('Your account is ready.');
          return { success: true, role: data.user.role };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Could not create your account. Please try again.');
          return { success: false };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
        toast.success('You are now signed out.');
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      toggleFavorite: async (pgId) => {
        try {
          const { data } = await api.post(`/users/favorites/${pgId}`);
          set(state => ({ user: { ...state.user, favorites: data.favorites.map(f => f._id || f) } }));
        } catch (err) {
          toast.error('Could not update saved listings.');
        }
      },

      isFavorite: (pgId) => {
        const { user } = get();
        if (!user?.favorites) return false;
        return user.favorites.some(f => (f._id || f) === pgId);
      },

      initAuth: () => {
        const { token } = get();
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }
    }),
    {
      name: 'pgfinder-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
