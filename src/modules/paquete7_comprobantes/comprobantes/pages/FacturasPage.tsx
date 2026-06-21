import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, RefreshCw, XCircle } from 'lucide-react';
import { ventaService } from '../../../paquete5_ventas/ventas/services/ventaService';
import axiosInstance from '../../../../api/axios';

const FacturasPage = () => {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await ventaService.getVentas();
      // Filtrar solo las que tienen factura
      setFacturas(data.filter((v: any) => v.requiere_factura && v.nro_factura));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const handleDownload = async (id: number, nroFactura: number) => {
    try {
      const response = await axiosInstance.get(`/ventas/${id}/factura`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_${String(nroFactura).padStart(5, '0')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Error al descargar la factura.");
    }
  };

  const handleAnular = async (id: number) => {
    const motivo = prompt("Ingrese el motivo de anulación:");
    if (!motivo) return;
    try {
      await ventaService.anularTicket(id, motivo);
      alert("Factura anulada con éxito.");
      fetchFacturas();
    } catch (e) {
      alert("Error al anular la factura.");
    }
  };

  const filtered = facturas.filter(f => 
    f.nombre_cliente?.toLowerCase().includes(search.toLowerCase()) || 
    f.nit_cliente?.includes(search) || 
    String(f.nro_factura).includes(search)
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facturas Emitidas</h1>
            <p className="text-sm text-gray-500">Historial de facturas generadas en las ventas POS</p>
          </div>
        </div>
        
        <button onClick={fetchFacturas} className="p-3 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 transition-all">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Nombre, NIT o N° Factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No hay facturas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-4 font-black">N° Factura</th>
                  <th className="py-4 px-4 font-black">Fecha</th>
                  <th className="py-4 px-4 font-black">Cliente</th>
                  <th className="py-4 px-4 font-black">NIT/CI</th>
                  <th className="py-4 px-4 font-black">Correo Electrónico</th>
                  <th className="py-4 px-4 font-black text-right">Monto (Bs.)</th>
                  <th className="py-4 px-4 font-black text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((factura) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={factura.id} 
                    className="border-b border-gray-50 hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="py-4 px-4 font-black text-gray-900">
                      {String(factura.nro_factura).padStart(5, '0')}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(factura.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 uppercase">{factura.nombre_cliente}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 font-mono">
                      {factura.nit_cliente}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {factura.email_cliente || '-'}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-blue-600">
                      {Number(factura.monto_total).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button 
                            onClick={() => handleDownload(factura.id, factura.nro_factura)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>
                          {factura.estado !== 'Cancelado' && (
                            <button 
                              onClick={() => handleAnular(factura.id)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                              title="Anular Factura"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>
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

export default FacturasPage;
