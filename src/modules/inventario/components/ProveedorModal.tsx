import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Loader, AlertCircle } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { Proveedor } from '../types/inventario.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerToEdit: Proveedor | null;
}

const ProveedorModal = ({ open, onClose, onSuccess, providerToEdit }: Props) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerToEdit) {
      setNombre(providerToEdit.nombre || '');
      setTelefono(providerToEdit.telefono || '');
      setCorreo(providerToEdit.correo || '');
      setDireccion(providerToEdit.direccion || '');
    } else {
      setNombre('');
      setTelefono('');
      setCorreo('');
      setDireccion('');
    }
    setError(null);
  }, [providerToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const payload = { nombre, telefono, correo, direccion };
      if (providerToEdit) {
        await inventarioService.updateProveedor(providerToEdit.id, payload);
      } else {
        await inventarioService.createProveedor(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Users className="text-purple-500" size={20} />
                {providerToEdit ? 'Modificar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nombre / Razón Social</label>
                  <input 
                    type="text" 
                    required
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                    placeholder="Ej. Distribuidora Alimentos S.A."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Teléfono</label>
                  <input 
                    type="text" 
                    value={telefono} 
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    placeholder="Ej. 77712345"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={correo} 
                    onChange={e => setCorreo(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    placeholder="Ej. contacto@proveedor.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Dirección</label>
                  <input 
                    type="text" 
                    value={direccion} 
                    onChange={e => setDireccion(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    placeholder="Ej. Av. Segunda Anillo #450"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !nombre.trim()}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-purple-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin mx-auto" /> : providerToEdit ? 'GUARDAR CAMBIOS' : 'REGISTRAR PROVEEDOR'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProveedorModal;
