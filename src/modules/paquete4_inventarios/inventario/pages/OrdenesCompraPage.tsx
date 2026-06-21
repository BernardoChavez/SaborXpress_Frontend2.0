import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  RefreshCw, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { OrdenCompra, Proveedor, InventarioItem } from '../types/inventario.types';
import CompraModal from '../components/CompraModal';
import DetalleCompraModal from '../components/DetalleCompraModal';

const OrdenesCompraPage = () => {
  const [compras, setCompras] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [itemsBruto, setItemsBruto] = useState<InventarioItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [showDetalleCompraModal, setShowDetalleCompraModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<OrdenCompra | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [comp, prov, bruto] = await Promise.all([
        inventarioService.getCompras(),
        inventarioService.getProveedores(),
        inventarioService.getAllBruto()
      ]);
      setCompras(comp);
      setProveedores(prov);
      setItemsBruto(bruto);
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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-100">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
            <p className="text-sm text-gray-500">Registro histórico e ingresos de mercancías</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowCompraModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} />
              Nueva Compra
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
          key="compras"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">ID</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Proveedor</th>
                      <th className="p-4">Monto Total</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs">
                    {compras.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                          No hay órdenes de compra registradas.
                        </td>
                      </tr>
                    ) : (
                      compras.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-black text-gray-900">#{c.id}</td>
                          <td className="p-4 text-gray-500">{new Date(c.fecha_orden).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-gray-700 uppercase">{c.proveedor?.nombre}</td>
                          <td className="p-4 font-black text-gray-900">{Number(c.monto_total).toFixed(2)} Bs.</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                              c.estado === 'Recibida' ? 'bg-green-50 text-green-600 border border-green-100' :
                              c.estado === 'Cancelada' ? 'bg-red-50 text-red-600 border border-red-100' :
                              'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {c.estado}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  const details = await inventarioService.getCompraById(c.id);
                                  setSelectedCompra(details);
                                  setShowDetalleCompraModal(true);
                                } catch (err) {
                                  alert('Error al cargar detalle de la compra.');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg transition-colors"
                            >
                              <Eye size={12} />
                              Detalles
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </motion.div>
      </AnimatePresence>

      <CompraModal 
        open={showCompraModal}
        onClose={() => setShowCompraModal(false)}
        onSuccess={fetchData}
        proveedores={proveedores}
        materiaPrima={itemsBruto}
      />

      <DetalleCompraModal 
        open={showDetalleCompraModal}
        onClose={() => { setShowDetalleCompraModal(false); setSelectedCompra(null); }}
        onSuccess={fetchData}
        orden={selectedCompra}
      />
    </div>
  );
};

export default OrdenesCompraPage;
