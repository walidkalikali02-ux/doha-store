import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setUser: (user) =>
          set(
            { user, isAuthenticated: !!user },
            { name: 'auth-set-user' }
          ),
        setLoading: (isLoading) => set({ isLoading }, { name: 'auth-set-loading' }),
        logout: () => set(initialState, { name: 'auth-logout' }),
      }),
      {
        name: 'roastery-auth',
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;