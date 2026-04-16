import axiosInstance from '../axios';
import type { LoginCredentials, LoginResponse } from '../../core/types/auth.types';

export const authApi = {
  /**
   * POST /api/login
   * Retorna el usuario y el token Bearer
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/login', credentials);
    return data;
  },

  /**
   * POST /api/logout
   * Invalida el token en el backend
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },

  /**
   * GET /api/me
   * Retorna el usuario autenticado actual
   */
  me: async () => {
    const { data } = await axiosInstance.get('/me');
    return data;
  },
};
