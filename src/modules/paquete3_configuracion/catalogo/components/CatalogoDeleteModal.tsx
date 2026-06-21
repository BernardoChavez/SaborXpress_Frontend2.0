import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface DeleteModalProps {
  open: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const CatalogoDeleteModal = ({ open, itemName, onClose, onConfirm }: DeleteModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'No se pudo eliminar el registro.');
      } else {
        setError('No se pudo eliminar el registro.');
      }
    }
    finally { setLoading(false); }
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="cdel-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
          <motion.div key="cdel-modal" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Eliminar registro</h3>
              <p className="text-sm text-gray-500 mb-6">
                ¿Seguro que deseas eliminar <span className="font-medium text-gray-800">"{itemName}"</span>? Esta acción no se puede deshacer.
              </p>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleConfirm} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors">
                  {loading && <Loader2 size={14} className="animate-spin" />} Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CatalogoDeleteModal;
