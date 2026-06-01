import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Trash2, Loader, AlertCircle } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { Proveedor, InventarioItem } from '../types/inventario.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proveedores: Proveedor[];
  materiaPrima: InventarioItem[];
}

interface DetalleItem {
  id_bruto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  unidad: string;
}

const CompraModal = ({ open, onClose, onSuccess, proveedores, materiaPrima }: Props) => {
  const [idProveedor, setIdProveedor] = useState('');
  const [detalles, setDetalles] = useState<DetalleItem[]>([]);
  
  // Temp inputs for adding an item
  const [selectedBrutoId, setSelectedBrutoId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precioUnitario, setPrecioUnitario] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIdProveedor('');
      setDetalles([]);
      setSelectedBrutoId('');
      setCantidad('1');
      setPrecioUnitario('0');
      setError(null);
    }
  }, [open]);

  const handleAddItem = () => {
    if (!selectedBrutoId || Number(cantidad) <= 0 || Number(precioUnitario) < 0) return;
    
    const item = materiaPrima.find(m => m.id === Number(selectedBrutoId));
    if (!item) return;

    // Check if already in details
    if (detalles.some(d => d.id_bruto === item.id)) {
      setError('Este insumo ya se encuentra agregado en el detalle.');
      return;
    }

    setDetalles([
      ...detalles,
      {
        id_bruto: item.id,
        nombre: item.nombre,
        cantidad: Number(cantidad),
        precio_unitario: Number(precioUnitario),
        unidad: item.unidad_medida
      }
    ]);

    // Reset temp inputs
    setSelectedBrutoId('');
    setCantidad('1');
    setPrecioUnitario('0');
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const total = detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProveedor || detalles.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      await inventarioService.createCompra({
        id_proveedor: Number(idProveedor),
        detalles: detalles.map(d => ({
          id_bruto: d.id_bruto,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario
        }))
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la orden de compra.');
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
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-red-500" size={20} />
                Registrar Orden de Compra
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Proveedor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Proveedor</label>
                <select 
                  required
                  value={idProveedor} 
                  onChange={e => setIdProveedor(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="">Seleccionar Proveedor...</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Agregar Detalle Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Añadir Insumo al Detalle</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400">Materia Prima</label>
                    <select
                      value={selectedBrutoId}
                      onChange={e => setSelectedBrutoId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold"
                    >
                      <option value="">Seleccionar Insumo...</option>
                      {materiaPrima.map(item => (
                        <option key={item.id} value={item.id}>{item.nombre} ({item.unidad_medida})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400">Cantidad</label>
                    <input 
                      type="number" 
                      min="0.01"
                      step="any"
                      value={cantidad} 
                      onChange={e => setCantidad(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400">Precio Unitario (Bs.)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      value={precioUnitario} 
                      onChange={e => setPrecioUnitario(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedBrutoId || Number(cantidad) <= 0}
                      className="w-full p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalles List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items Agregados</h3>
                {detalles.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 italic">
                    Ningún insumo agregado al detalle todavía.
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                    {detalles.map((d, index) => (
                      <div key={d.id_bruto} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-gray-50/50">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 uppercase">{d.nombre}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {d.cantidad} {d.unidad} x {d.precio_unitario.toFixed(2)} Bs.
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-gray-900">
                            {(d.cantidad * d.precio_unitario).toFixed(2)} Bs.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Balance */}
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100/50 shrink-0">
                <span className="text-xs font-black text-red-600 uppercase tracking-wider">Total Estimado Compra</span>
                <span className="text-xl font-black text-red-600">{total.toFixed(2)} Bs.</span>
              </div>

              <button 
                disabled={loading || !idProveedor || detalles.length === 0}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin mx-auto" /> : 'GENERAR ORDEN DE COMPRA'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompraModal;
