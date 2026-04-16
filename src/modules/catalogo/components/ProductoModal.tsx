import { useState, useEffect } from 'react';
import { X, ShoppingBag, DollarSign, LayoutGrid, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseApiError } from '../../../utils/parseApiError';
import type { Producto, Categoria, CreateProductoDto } from '../types/catalogo.types';

interface ProductoModalProps {
  open: boolean;
  producto?: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSubmit: (dto: CreateProductoDto, id?: number) => Promise<void>;
}

interface FormData { nombre: string; precio_venta: string; id_categoria: string; }
interface Errors { nombre?: string; precio_venta?: string; id_categoria?: string; }

const ProductoModal = ({ open, producto, categorias, onClose, onSubmit }: ProductoModalProps) => {
  const isEditing = !!producto;
  const [form, setForm] = useState<FormData>({ nombre: '', precio_venta: '', id_categoria: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({ nombre: producto.nombre, precio_venta: String(producto.precio_venta), id_categoria: String(producto.id_categoria) });
    } else {
      setForm({ nombre: '', precio_venta: '', id_categoria: categorias[0] ? String(categorias[0].id) : '' });
    }
    setErrors({});
    setServerError(null);
  }, [producto, open, categorias]);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.precio_venta || isNaN(Number(form.precio_venta)) || Number(form.precio_venta) <= 0)
      e.precio_venta = 'Ingresa un precio válido mayor a 0';
    if (!form.id_categoria) e.id_categoria = 'Selecciona una categoría';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field: keyof FormData, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      await onSubmit({ nombre: form.nombre.trim(), precio_venta: Number(form.precio_venta), id_categoria: Number(form.id_categoria) }, producto?.id);
      onClose();
    } catch (err: unknown) {
      const { summary, fields } = parseApiError(err);
      setErrors((prev) => ({
        ...prev,
        ...(fields.nombre && { nombre: fields.nombre }),
        ...(fields.precio_venta && { precio_venta: fields.precio_venta }),
        ...(fields.id_categoria && { id_categoria: fields.id_categoria }),
      }));
      setServerError(Object.keys(fields).length > 0 ? null : summary);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="prod-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
          <motion.div key="prod-modal" initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar producto' : 'Nuevo producto'}
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
                  {/* Nombre */}
                  <div>
                    <label htmlFor="prod-nombre" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <ShoppingBag size={14} className="text-gray-400" /> Nombre del producto
                    </label>
                    <input id="prod-nombre" type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                      placeholder="Ej: Hamburguesa Premium"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.nombre ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-400'}`} />
                    {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                  </div>
                  {/* Precio */}
                  <div>
                    <label htmlFor="prod-precio" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <DollarSign size={14} className="text-gray-400" /> Precio de venta
                    </label>
                    <input id="prod-precio" type="number" step="0.01" min="0" value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)}
                      placeholder="0.00"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${errors.precio_venta ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-400'}`} />
                    {errors.precio_venta && <p className="text-xs text-red-500 mt-1">{errors.precio_venta}</p>}
                  </div>
                  {/* Categoría */}
                  <div>
                    <label htmlFor="prod-categoria" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <LayoutGrid size={14} className="text-gray-400" /> Categoría
                    </label>
                    <select id="prod-categoria" value={form.id_categoria} onChange={e => set('id_categoria', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition ${errors.id_categoria ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-orange-400'}`}>
                      <option value="">— Seleccionar —</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    {errors.id_categoria && <p className="text-xs text-red-500 mt-1">{errors.id_categoria}</p>}
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
                    {isEditing ? 'Guardar cambios' : 'Crear producto'}
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

export default ProductoModal;
