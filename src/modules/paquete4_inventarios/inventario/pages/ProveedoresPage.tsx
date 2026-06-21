import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Phone,
  Mail,
  MapPin,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { Proveedor } from '../types/inventario.types';
import ProveedorModal from '../components/ProveedorModal';

const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<Proveedor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prov = await inventarioService.getProveedores();
      setProveedores(prov);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Error al cargar la información del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProveedor = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este proveedor?')) return;
    try {
      await inventarioService.deleteProveedor(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el proveedor.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-100">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuestros Proveedores</h1>
            <p className="text-sm text-gray-500">Directorio de contactos autorizados para compras</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => { setProviderToEdit(null); setShowProveedorModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-purple-100 active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} />
              Nuevo Proveedor
            </button>
            <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="proveedores"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {proveedores.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center text-gray-400 italic">
                  No hay proveedores registrados.
                </div>
              ) : (
                proveedores.map(p => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-black text-gray-900 uppercase text-sm mb-3">{p.nombre}</h3>
                      <div className="space-y-2 text-xs text-gray-600">
                        {p.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-purple-400" />
                            <span>{p.telefono}</span>
                          </div>
                        )}
                        {p.correo && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-purple-400" />
                            <span>{p.correo}</span>
                          </div>
                        )}
                        {p.direccion && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-purple-400" />
                            <span>{p.direccion}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between shrink-0">
                      <button
                        onClick={() => { setProviderToEdit(p); setShowProveedorModal(true); }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-black uppercase rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProveedor(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
        </motion.div>
      </AnimatePresence>

      <ProveedorModal 
        open={showProveedorModal}
        onClose={() => { setShowProveedorModal(false); setProviderToEdit(null); }}
        onSuccess={fetchData}
        providerToEdit={providerToEdit}
      />
    </div>
  );
};

export default ProveedoresPage;
