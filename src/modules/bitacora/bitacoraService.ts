import axiosInstance from '../../api/axios';
import type { BitacoraEntry } from './types/bitacora.types';

export const bitacoraService = {
  getAll: async (): Promise<BitacoraEntry[]> => {
    const { data } = await axiosInstance.get<BitacoraEntry[]>('/bitacora');
    return data;
  },
};
