export interface Empresa {
  id: number;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  moneda: string;
  sucursal: string | null;
  ciudad: string | null;
  actividad_economica: string | null;
  codigo_autorizacion: string | null;
  leyenda_factura: string | null;
}

export type UpdateEmpresaDto = Omit<Empresa, 'id'>;
