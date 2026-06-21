import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, RefreshCw, AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cajaService } from '../services/cajaService';
import type { Caja } from '../services/cajaService';
import EgresoCajaModal from '../components/EgresoCajaModal';

const CajaChicaPage = () => {
  const [loading, setLoading] = useState(false);
  const [egresos, setEgresos] = useState<any[]>([]);
  const [cajaEstado, setCajaEstado] = useState<Caja | null>(null);
  const [showEgresoModal, setShowEgresoModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [estadoData, egresosData] = await Promise.all([
        cajaService.getEstado(),
        cajaService.getEgresos()
      ]);
      
      if (estadoData.caja) {
        setCajaEstado(estadoData.caja);
      }
      setEgresos(egresosData);
    } catch (e: any) {
      console.error(e);
      alert('Error al cargar caja chica: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-100">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caja Chica</h1>
            <p className="text-sm text-gray-500">Gestión de egresos y reportes de salidas menores</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowEgresoModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-100 active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} />
              Registrar Egreso
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

      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><Wallet size={20}/></div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Inicial + Ventas</p>
                    <p className="text-2xl font-black text-gray-900">
                        {cajaEstado ? `Bs. ${(Number(cajaEstado.monto_apertura) + Number(cajaEstado.ventas_totales || 0)).toFixed(2)}` : '0.00 Bs.'}
                    </p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><ArrowDownCircle size={20}/></div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Egresos</p>
                    <p className="text-2xl font-black text-red-600">
                        {cajaEstado ? `Bs. ${Number(cajaEstado.egresos || 0).toFixed(2)}` : '0.00 Bs.'}
                    </p>
                </div>
            </div>
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><ArrowUpCircle size={20}/></div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo en Gaveta Esperado</p>
                    <p className="text-2xl font-black text-gray-900">
                        {cajaEstado ? `Bs. ${Number(cajaEstado.monto_esperado_efectivo || 0).toFixed(2)}` : '0.00 Bs.'}
                    </p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Concepto / Motivo</th>
                            <th className="p-4">Monto</th>
                            <th className="p-4">Usuario Autoriza</th>
                            <th className="p-4">Estado Caja</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                        {loading && (!egresos || !Array.isArray(egresos) || egresos.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400 italic">Cargando egresos...</td>
                            </tr>
                        ) : (!egresos || !Array.isArray(egresos) || egresos.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                                    <div className="flex flex-col items-center justify-center">
                                      <AlertCircle size={32} className="text-gray-300 mb-2" />
                                      <span>No hay movimientos registrados en caja chica.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            egresos.map((egreso: any) => (
                                <tr key={egreso?.id || Math.random()} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-gray-500">
                                        {egreso?.created_at ? new Date(egreso.created_at).toLocaleString() : 'Desconocida'}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800 uppercase text-[11px] max-w-sm">
                                        {egreso?.motivo || 'Sin motivo'}
                                    </td>
                                    <td className="p-4 font-black text-red-600">
                                        - Bs. {Number(egreso?.monto || 0).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-gray-500 font-bold uppercase text-[10px]">
                                        {egreso?.usuario?.persona?.nombre || 'Desconocido'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                            egreso?.caja?.estado === 'Abierta' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                            Caja {egreso?.caja?.estado || 'Cerrada'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </motion.div>

      <EgresoCajaModal 
          isOpen={showEgresoModal}
          onClose={() => setShowEgresoModal(false)}
          onSuccess={fetchData}
      />
    </div>
  );
};

export default CajaChicaPage;
