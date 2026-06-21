import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { InventarioItem } from '../types/inventario.types';

interface MermaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productos: InventarioItem[];
}

const MermaModal = ({ open, onClose, onSuccess, productos }: MermaModalProps) => {
  const [formData, setFormData] = useState({
    id_producto: '',
    cantidad: '',
    motivo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({ id_producto: '', cantidad: '', motivo: '' });
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.id_producto || !formData.cantidad || !formData.motivo) {
        throw new Error("Todos los campos son obligatorios.");
      }

      await inventarioService.registrarMerma({
        id_producto: Number(formData.id_producto),
        cantidad: Number(formData.cantidad),
        motivo: formData.motivo,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al registrar la merma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-red-500 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold">Registrar Merma</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 border border-red-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form id="merma-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Producto</label>
                <select
                  value={formData.id_producto}
                  onChange={e => setFormData({ ...formData, id_producto: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock} {p.unidad_medida})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cantidad a Descontar</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.cantidad}
                  onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Motivo / Justificación</label>
                <textarea
                  value={formData.motivo}
                  onChange={e => setFormData({ ...formData, motivo: e.target.value })}
                  rows={3}
                  placeholder="Ej: Producto caducado, accidente en cocina..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none"
                  required
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="merma-form"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
              Confirmar Merma
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MermaModal;
