import { useState, useEffect } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseApiError } from '../../../utils/parseApiError';
import type { Categoria, CreateCategoriaDto } from '../types/catalogo.types';

interface CategoriaModalProps {
  open: boolean;
  categoria?: Categoria | null;
  onClose: () => void;
  onSubmit: (dto: CreateCategoriaDto, id?: number) => Promise<void>;
}

const CategoriaModal = ({ open, categoria, onClose, onSubmit }: CategoriaModalProps) => {
  const isEditing = !!categoria;
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNombre(categoria?.nombre ?? '');
    setError('');
    setServerError(null);
  }, [categoria, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    setLoading(true);
    setServerError(null);
    try {
      await onSubmit({ nombre: nombre.trim() }, categoria?.id);
      onClose();
    } catch (err: unknown) {
      const { summary, fields } = parseApiError(err);
      if (fields.nombre) {
        setError(fields.nombre);
        setServerError(null);
      } else {
        setError('');
        setServerError(summary);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="cat-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
          <motion.div key="cat-modal" initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar categoría' : 'Nueva categoría'}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-4">
                  {serverError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{serverError}</p>
                  )}
                  <div>
                    <label htmlFor="cat-nombre" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Tag size={15} className="text-gray-400" /> Nombre de categoría
                    </label>
                    <input id="cat-nombre" type="text" value={nombre} onChange={e => { setNombre(e.target.value); setError(''); }}
                      placeholder="Ej: Bebidas, Postres…"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-400'}`} />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button type="button" onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 rounded-lg transition-colors">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? 'Guardar cambios' : 'Crear categoría'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategoriaModal;
