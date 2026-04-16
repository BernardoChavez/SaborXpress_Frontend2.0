import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';

// Guards
import ProtectedRoute from '../../shared/components/ProtectedRoute';

// Auth pages
import LoginPage from '../../modules/auth/pages/LoginPage';
import UnauthorizedPage from '../../modules/auth/pages/UnauthorizedPage';

// Módulos
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import UsuariosPage  from '../../modules/usuarios/pages/UsuariosPage';
import CatalogoPage  from '../../modules/catalogo/pages/CatalogoPage';
import BitacoraPage  from '../../modules/bitacora/pages/BitacoraPage';

export const router = createBrowserRouter([
  // ── Rutas públicas (auth) ─────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // ── Ruta de error de permisos ─────────────────────────────────────────────
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // ── Rutas protegidas: cualquier usuario autenticado ───────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
        ],
      },
    ],
  },

  // ── Rutas protegidas: Solo Admin ──────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/admin/dashboard', element: <DashboardPage /> },
          { path: '/admin/usuarios',  element: <UsuariosPage /> },
          { path: '/admin/catalogo',  element: <CatalogoPage /> },
          { path: '/admin/bitacora',  element: <BitacoraPage /> },
        ],
      },
    ],
  },
]);
