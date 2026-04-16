import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/useAuthStore';

/**
 * Página mostrada cuando el usuario intenta acceder a una ruta
 * para la que no tiene permisos suficientes.
 */
const UnauthorizedPage = () => {
  const { isAuthenticated, tipo_usuario } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleGoBack = () => {
    switch (tipo_usuario) {
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-orange-500">403</p>
        <h1 className="text-2xl font-semibold text-gray-800 mt-4">Acceso no autorizado</h1>
        <p className="text-gray-500 mt-2">No tienes permisos para ver esta página.</p>
        <button
          onClick={handleGoBack}
          className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
