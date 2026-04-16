import { Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';
import Sidebar from '../shared/components/Sidebar';
import Header from '../shared/components/Header';

/**
 * Layout principal para páginas autenticadas.
 * Estructura: Sidebar fijo a la izquierda | Header + contenido a la derecha.
 */
const MainLayout = () => {
  const { user, tipo_usuario, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sidebar tipoUsuario={tipo_usuario} />

      {/* ── Área principal ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header sticky */}
        <Header user={user} onLogout={logout} />

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
