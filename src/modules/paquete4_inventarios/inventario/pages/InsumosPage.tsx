import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Layers, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  Ban,
  AlertCircle
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { InventarioItem } from '../types/inventario.types';
import TransformacionModal from '../components/TransformacionModal';
import ItemInventarioModal from '../components/ItemInventarioModal';
import MermaModal from '../components/MermaModal';

type StockFilter = 'todos' | 'disponible' | 'bajo' | 'agotado';

const InsumosPage = () => {
  const [itemsBruto, setItemsBruto] = useState<InventarioItem[]>([]);
  const [itemsProcesado, setItemsProcesado] = useState<InventarioItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos');
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [showMermaModal, setShowMermaModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventarioItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bruto, procesado] = await Promise.all([
        inventarioService.getAllBruto(),
        inventarioService.getAllProcesado(),
      ]);
      setItemsBruto(bruto);
      setItemsProcesado(procesado);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError('Error al cargar la información del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterItems = (items: InventarioItem[]) => {
    if (stockFilter === 'todos') return items;
    return items.filter(item => {
      const stock = Number(item.stock);
      const min = Number(item.stock_minimo);
      if (stockFilter === 'disponible') return stock > min;
      if (stockFilter === 'bajo') return stock <= min && stock > 0;
      if (stockFilter === 'agotado') return stock <= 0;
      return true;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-100">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insumos Procesados</h1>
            <p className="text-sm text-gray-500">Gestión de productos listos para producción o cocina</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowMermaModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95"
            >
                <AlertTriangle size={16} />
                Registrar Merma
            </button>
            <button 
                onClick={() => setShowTransformModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
                <RefreshCw size={16} />
                Transformar Insumos
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

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-2 rounded-[24px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl w-full xl:w-auto">
              <FilterSelect 
                value={stockFilter} 
                onChange={(val) => setStockFilter(val as StockFilter)} 
              />
            </div>
          </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="procesado"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <InventoryGrid 
            items={filterItems(itemsProcesado)} 
            title="Insumos Procesados" 
            description="Productos listos para cocinar"
            color="green"
            onAdd={() => { setItemToEdit(null); setShowItemModal(true); }}
            onEdit={(item) => { setItemToEdit(item); setShowItemModal(true); }}
          />
        </motion.div>
      </AnimatePresence>

      <TransformacionModal 
        open={showTransformModal} 
        onClose={() => setShowTransformModal(false)}
        bruto={itemsBruto}
        procesado={itemsProcesado}
        onSuccess={fetchData}
      />

      <MermaModal 
        open={showMermaModal}
        onClose={() => setShowMermaModal(false)}
        onSuccess={fetchData}
        productos={itemsProcesado}
      />

      <ItemInventarioModal 
        open={showItemModal}
        tipo={'procesado'}
        itemToEdit={itemToEdit}
        onClose={() => { setShowItemModal(false); setItemToEdit(null); }}
        onSuccess={fetchData}
      />
    </div>
  );
};

const FilterSelect = ({ value, onChange }: { value: StockFilter, onChange: (v: string) => void }) => {
  const options = [
    { id: 'todos',      label: 'Todos',      icon: <Layers size={14}/>,   color: 'gray' },
    { id: 'disponible', label: 'Disponible',  icon: <CheckCircle size={14}/>, color: 'green' },
    { id: 'bajo',       label: 'Bajo Stock', icon: <AlertTriangle size={14}/>, color: 'orange' },
    { id: 'agotado',    label: 'Agotado',    icon: <Ban size={14}/>,           color: 'red' },
  ];

  return (
    <div className="flex gap-1">
      {options.map(opt => {
        const isActive = value === opt.id;
        const colorVariants: Record<string, string> = {
          gray: isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700',
          green: isActive ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:text-green-600 hover:bg-green-50',
          orange: isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50',
          red: isActive ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-gray-500 hover:text-red-600 hover:bg-red-50',
        };

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${colorVariants[opt.color]}`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const InventoryGrid = ({ items, title, description, color, onAdd, onEdit }: { items: InventarioItem[], title: string, description: string, color: string, onAdd: () => void, onEdit: (item: InventarioItem) => void }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-2">
        <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description} • {items.length} resultados</p>
        </div>
        <button 
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2 ${color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-gray-100 active:scale-95`}
        >
            <Plus size={16} />
            Nuevo Registro
        </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <Filter size={32} />
            </div>
            <p className="text-gray-400 text-sm font-medium">No se encontraron productos con este filtro</p>
        </div>
      ) : (
        items.map((item: any) => {
          const isCritical = Number(item.stock) <= Number(item.stock_minimo);
          const isAgotado = Number(item.stock) <= 0;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase text-sm">{item.nombre}</h3>
                  <p className="text-[10px] text-gray-400 font-black tracking-widest">CATEGORÍA: {item.categoria?.nombre || 'General'}</p>
                </div>
                <div className={`p-2 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                  <Package size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Existencia</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isAgotado ? 'text-red-600' : isCritical ? 'text-orange-500' : 'text-gray-900'}`}>
                      {Number(item.stock).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unidad_medida}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Stock Mínimo</p>
                  <p className="text-sm font-black text-gray-700">{Number(item.stock_minimo).toLocaleString()} <span className="text-[9px] opacity-50">{item.unidad_medida}</span></p>
                </div>
              </div>

              <div className="mt-4 pt-4 flex items-center justify-between">
                {isAgotado ? (
                  <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                    <Ban size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Agotado Total</span>
                  </div>
                ) : isCritical ? (
                  <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Bajo Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                    <CheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Disponible</span>
                  </div>
                )}
                <button 
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  Modificar
                </button>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  </div>
);

export default InsumosPage;
