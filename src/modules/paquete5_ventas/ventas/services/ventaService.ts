import axiosInstance from '../../../../api/axios';

export interface VentaDetalleDto {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
}

export interface CreateVentaDto {
    metodo_pago: 'Efectivo' | 'QR';
    tipo_entrega: 'Mesa' | 'Llevar';
    codigo_qr?: string;
    detalles: VentaDetalleDto[];
    VentaEstado?: string;
    requiere_factura?: boolean;
    nit_cliente?: string;
    nombre_cliente?: string;
    telefono_cliente?: string;
    email_cliente?: string;
}

export const ventaService = {
    registrar: async (dto: CreateVentaDto) => {
        const { data } = await axiosInstance.post('/ventas', dto);
        return data;
    },
    getVentas: async () => {
        const { data } = await axiosInstance.get('/ventas');
        return data;
    },
    getTicket: async (id: number) => {
        const { data } = await axiosInstance.get(`/ventas/${id}/ticket`);
        return data;
    },
    anularTicket: async (id: number, motivo_anulacion: string) => {
        const { data } = await axiosInstance.post(`/ventas/${id}/anular`, { motivo_anulacion });
        return data;
    },
    getAnuladas: async () => {
        const { data } = await axiosInstance.get('/ventas-anuladas');
        return data;
    }
};

