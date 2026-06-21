import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Loader, AlertCircle } from 'lucide-react';
import { cajaService } from '../services/cajaService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EgresoCajaModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [monto, setMonto] = useState('0');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(monto) <= 0 || !motivo.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await cajaService.registrarEgreso(Number(monto), motivo);
      onSuccess();
      onClose();
      // Reset
      setMonto('0');
      setMotivo('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar egreso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ArrowUpRight className="text-red-500" size={20} />
                Registrar Egreso
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto (Bs.)</label>
                  <input 
                    required
                    type="number" 
                    min="0.01"
                    step="any"
                    value={monto} 
                    onChange={e => setMonto(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xl font-black focus:border-red-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo / Descripción</label>
                  <input 
                    required
                    type="text" 
                    value={motivo} 
                    onChange={e => setMotivo(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:border-red-500 outline-none transition-all"
                    placeholder="Ej. Pago a proveedor de verduras"
                  />
                </div>
              </div>

              <button 
                disabled={loading || Number(monto) <= 0 || !motivo.trim()}
                type="submit"
                className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-black rounded-3xl shadow-xl shadow-red-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin mx-auto" /> : 'REGISTRAR SALIDA'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EgresoCajaModal;
