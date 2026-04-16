import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';
import type { TipoUsuario } from '../../core/types/auth.types';

interface ProtectedRouteProps {
  /** Lista de roles que pueden acceder. Si está vacío, solo requiere autenticación. */
  allowedRoles?: TipoUsuario[];
  /** Ruta de redirección si no está autenticado */
  redirectTo?: string;
  /** Ruta de redirección si no tiene permiso (rol insuficiente) */
  unauthorizedPath?: string;
}

/**
 * ProtectedRoute
 * - Si el usuario NO está autenticado → redirige a /login
 * - Si el usuario está autenticado pero su rol NO está en allowedRoles → redirige a /unauthorized
 * - Si todo OK → renderiza el <Outlet />
 */
const ProtectedRoute = ({
  allowedRoles = [],
  redirectTo = '/login',
  unauthorizedPath = '/unauthorized',
}: ProtectedRouteProps) => {
  const { isAuthenticated, tipo_usuario } = useAuthStore();

  // 1. No autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2. Roles definidos pero el usuario no tiene el rol requerido
  if (allowedRoles.length > 0 && (!tipo_usuario || !allowedRoles.includes(tipo_usuario))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  // 3. Todo OK
  return <Outlet />;
};

export default ProtectedRoute;
