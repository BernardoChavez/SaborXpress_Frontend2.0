export interface InventarioItem {
    id: number;
    nombre: string;
    stock: number;
    unidad_medida: string;
    stock_minimo: number;
    created_at?: string;
    updated_at?: string;
}

export interface FichaTransformacion {
    id: number;
    id_bruto: number;
    id_procesado: number;
    cantidad_bruto: number;
    cantidad_procesado: number;
    bruto?: InventarioItem;
    procesado?: InventarioItem;
}

export interface Receta {
    id: number;
    id_producto: number;
    id_procesado: number;
    cantidad: number;
    procesado?: InventarioItem;
}

export interface CreateInventarioDto {
    nombre: string;
    stock: number;
    unidad_medida: string;
    stock_minimo: number;
}

export interface Proveedor {
    id: number;
    nombre: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateProveedorDto {
    nombre: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
}

export interface OrdenCompraDetalle {
    id: number;
    id_orden_compra: number;
    id_bruto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    bruto?: InventarioItem;
}

export interface OrdenCompra {
    id: number;
    id_proveedor: number;
    id_usuario: number;
    monto_total: number;
    estado: 'Pendiente' | 'Recibida' | 'Cancelada';
    fecha_orden: string;
    fecha_recepcion?: string;
    created_at?: string;
    updated_at?: string;
    proveedor?: Proveedor;
    detalles?: OrdenCompraDetalle[];
    usuario?: {
        id_persona: number;
        correo: string;
        persona?: {
            id: number;
            nombre: string;
            telefono?: string;
        }
    };
}

