// ── Categoría ─────────────────────────────────────────────────────────────────
export interface Categoria {
  id: number;
  nombre: string;
}

export interface CreateCategoriaDto {
  nombre: string;
}

// ── Producto ──────────────────────────────────────────────────────────────────
export interface Producto {
  id: number;
  nombre: string;
  precio_venta: number;
  id_categoria: number;
  categoria?: Categoria;
}

export interface CreateProductoDto {
  nombre: string;
  precio_venta: number;
  id_categoria: number;
}

export type UpdateProductoDto = Partial<CreateProductoDto>;
