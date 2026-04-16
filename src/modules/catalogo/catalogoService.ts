import axiosInstance from '../../api/axios';
import type {
  Categoria, CreateCategoriaDto,
  Producto, CreateProductoDto, UpdateProductoDto,
} from './types/catalogo.types';

// ── Categorías ────────────────────────────────────────────────────────────────
export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const { data } = await axiosInstance.get<Categoria[]>('/categorias');
    return data;
  },
  create: async (dto: CreateCategoriaDto): Promise<Categoria> => {
    const { data } = await axiosInstance.post<Categoria>('/categorias', dto);
    return data;
  },
  update: async (id: number, dto: CreateCategoriaDto): Promise<Categoria> => {
    const { data } = await axiosInstance.put(`/categorias/${id}`, dto);
    // El backend envuelve en { message, categoria }
    return (data as { categoria?: Categoria }).categoria ?? data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categorias/${id}`);
  },
};

// ── Productos ─────────────────────────────────────────────────────────────────
export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const { data } = await axiosInstance.get<Producto[]>('/productos');
    return data;
  },
  create: async (dto: CreateProductoDto): Promise<Producto> => {
    const { data } = await axiosInstance.post<Producto>('/productos', dto);
    return data;
  },
  update: async (id: number, dto: UpdateProductoDto): Promise<Producto> => {
    const { data } = await axiosInstance.put(`/productos/${id}`, dto);
    return (data as { producto?: Producto }).producto ?? data;
  },
  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};
