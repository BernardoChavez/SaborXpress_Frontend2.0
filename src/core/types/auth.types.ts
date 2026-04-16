export type TipoUsuario = 'Admin' | 'Cajero' | 'Cocinero';

export interface User {
  id: number;
  correo: string;
  tipo_usuario: TipoUsuario;
  persona?: {
    nombre: string;
    telefono: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tipo_usuario: TipoUsuario | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
