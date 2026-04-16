import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth.types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tipo_usuario: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          tipo_usuario: user.tipo_usuario,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          tipo_usuario: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'saborxpress-auth', // clave en localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tipo_usuario: state.tipo_usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
