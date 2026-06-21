export type TipoUsuarioSistema = 'Admin' | 'Cajero' | 'Cocinero';

export interface Usuario {
  id: number;
  correo: string;
  tipo_usuario: TipoUsuarioSistema;
  persona: {
    nombre: string;
    telefono: string;
  };
}

export interface CreateUsuarioDto {
  nombre: string;
  telefono: string;
  correo: string;
  contrasena: string;
  tipo_usuario: TipoUsuarioSistema;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  telefono?: string;
  correo?: string;
  contrasena?: string;
  tipo_usuario?: TipoUsuarioSistema;
}
