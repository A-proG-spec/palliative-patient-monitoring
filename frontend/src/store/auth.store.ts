import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;  // NEW: Track auth initialization
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setInitialized: () => void;  // NEW: Mark initialization complete
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: true,  // Start as initializing

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isInitializing: false }),

      updateUser: (updatedFields) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updatedFields } });
        }
      },

      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isInitializing: false 
      }),

      setInitialized: () => set({ isInitializing: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Don't persist isInitializing
      }),
    }
  )
);