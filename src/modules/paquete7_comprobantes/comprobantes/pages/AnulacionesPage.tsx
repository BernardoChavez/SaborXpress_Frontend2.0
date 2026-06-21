import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Search, RefreshCw } from 'lucide-react';
import { ventaService } from '../../../paquete5_ventas/ventas/services/ventaService';

const AnulacionesPage = () => {
  const [anulaciones, setAnulaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnuladas = async () => {
    setLoading(true);
    try {
      const data = await ventaService.getAnuladas();
      setAnulaciones(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnuladas();
  }, []);

  const filtered = anulaciones.filter(a => 
    a.nombre_cliente?.toLowerCase().includes(search.toLowerCase()) || 
    String(a.nro_factura).includes(search) ||
    String(a.nro_pedido).includes(search)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-100">
            <XCircle size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anulaciones</h1>
            <p className="text-sm text-gray-500">Historial de tickets y facturas anuladas</p>
          </div>
        </div>
        
        <button onClick={fetchAnuladas} className="p-3 text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 transition-all">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Nombre, N° Pedido o N° Factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-red-500" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No hay registros de anulaciones.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-4 font-black">N° Pedido / Factura</th>
                  <th className="py-4 px-4 font-black">Fecha Anulación</th>
                  <th className="py-4 px-4 font-black">Cliente</th>
                  <th className="py-4 px-4 font-black">Motivo de Anulación</th>
                  <th className="py-4 px-4 font-black text-right">Monto (Bs.)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={item.id} 
                    className="border-b border-gray-50 hover:bg-red-50/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-black text-gray-900">
                      {item.requiere_factura ? `Fac: ${String(item.nro_factura).padStart(5, '0')}` : `Ped: #${item.nro_pedido}`}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(item.fecha_anulacion).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 uppercase">{item.nombre_cliente || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-red-600 font-medium">
                      {item.motivo_anulacion}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-gray-400 line-through">
                      {Number(item.monto_total).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnulacionesPage;
