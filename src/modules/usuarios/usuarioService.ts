import axiosInstance from '../../api/axios';
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './types/usuario.types';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const { data } = await axiosInstance.get<Usuario[]>('/usuarios');
    return data;
  },

  getById: async (id: number): Promise<Usuario> => {
    const { data } = await axiosInstance.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  create: async (dto: CreateUsuarioDto): Promise<Usuario> => {
    const { data } = await axiosInstance.post<Usuario>('/usuarios', dto);
    return data;
  },

  update: async (id: number, dto: UpdateUsuarioDto): Promise<Usuario> => {
    const { data } = await axiosInstance.put<Usuario>(`/usuarios/${id}`, dto);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/usuarios/${id}`);
  },
};
