import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageCheck, RefreshCw, AlertCircle, Plus, X, Calendar, User, ShoppingCart, Check } from 'lucide-react';
import axiosInstance from '../../../../api/axios';
import { useAuthStore } from '../../../../core/store/useAuthStore';

interface OrdenCompra {
  id: number;
  id_proveedor: number;
  monto_total: string;
  estado: string;
  fecha_orden: string;
  fecha_recepcion: string | null;
  proveedor: {
    nombre_empresa: string;
    nombre_contacto: string;
  };
  usuario: {
    persona?: {
      nombre: string;
    };
    correo: string;
  };
}

const RecepcionPage = () => {
  const [loading, setLoading] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuthStore();

  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/ordenes-compra');
      setOrdenes(response.data);
    } catch (error) {
      console.error('Error fetching ordenes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const pendingOrders = ordenes.filter(o => o.estado === 'Pendiente');
  const receivedOrders = ordenes.filter(o => o.estado === 'Recibida');

  const handleRegisterReception = async () => {
    if (!selectedOrderId) return;
    setSubmitting(true);
    try {
      await axiosInstance.post(`/ordenes-compra/${selectedOrderId}/recibir`);
      setIsModalOpen(false);
      setSelectedOrderId('');
      fetchOrdenes(); // Recargar datos
    } catch (error) {
      console.error('Error registering reception:', error);
      alert('Ocurrió un error al registrar la recepción.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const encargadoNombre = user?.persona?.nombre || user?.correo || 'Usuario Actual';

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <PackageCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recepción de Mercadería</h1>
            <p className="text-sm text-gray-500">Ingreso físico de productos al almacén central</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} />
              Registrar Recepción
            </button>
            <button 
                onClick={fetchOrdenes}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
            </button>
        </div>
      </div>

      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
      >
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            <th className="p-4 pl-8">Nro. Recepción</th>
                            <th className="p-4">Orden Asociada</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Recibido Por</th>
                            <th className="p-4 pr-8">Estado Revisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                        {loading && receivedOrders.length === 0 ? (
                           <tr>
                               <td colSpan={5} className="p-10 text-center text-gray-400">Cargando recepciones...</td>
                           </tr>
                        ) : receivedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                                    <div className="flex flex-col items-center justify-center">
                                      <AlertCircle size={32} className="text-gray-300 mb-2" />
                                      <span>No hay recepciones de mercadería registradas.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            receivedOrders.map(orden => (
                                <tr key={orden.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 pl-8 font-bold text-gray-800">REC-{orden.id.toString().padStart(5, '0')}</td>
                                    <td className="p-4 font-medium text-gray-600">
                                        OC-{orden.id.toString().padStart(5, '0')} <span className="text-gray-400 ml-1">({orden.proveedor?.nombre_empresa || 'Proveedor Desconocido'})</span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {orden.fecha_recepcion ? new Date(orden.fecha_recepcion).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">
                                        {orden.usuario?.persona?.nombre || orden.usuario?.correo || 'Desconocido'}
                                    </td>
                                    <td className="p-4 pr-8">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md tracking-wider">Completado</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </motion.div>

      {/* Modal de Registro de Recepción */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-lg relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => !submitting && setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <PackageCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Confirmar Recepción</h2>
                  <p className="text-xs text-slate-500">Ingresa los detalles para registrar la llegada de inventario</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Encargado */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Encargado de Recepción</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                    <User size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">{encargadoNombre}</span>
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Fecha de Ingreso</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                    <Calendar size={18} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">{currentDate}</span>
                  </div>
                </div>

                {/* Orden Pendiente */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Orden de Compra a Recibir</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <ShoppingCart size={18} className="text-gray-400" />
                    </div>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-bold text-slate-700 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Selecciona una orden pendiente...</option>
                      {pendingOrders.map(orden => (
                        <option key={orden.id} value={orden.id}>
                          OC-{orden.id.toString().padStart(5, '0')} — {orden.proveedor?.nombre_empresa || 'Proveedor'} (Bs {orden.monto_total})
                        </option>
                      ))}
                    </select>
                  </div>
                  {pendingOrders.length === 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1">
                      <AlertCircle size={12} /> No hay órdenes pendientes de recepción en este momento.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterReception}
                  disabled={!selectedOrderId || submitting}
                  className="flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={16} /> Confirmar Ingreso
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecepcionPage;
