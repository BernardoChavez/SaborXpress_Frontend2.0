import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Settings, 
  RefreshCw, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { FichaTransformacion, Receta, InventarioItem } from '../types/inventario.types';
import RecetasModal from '../components/RecetasModal';

const RecetasPage = () => {
  const [fichas, setFichas] = useState<FichaTransformacion[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [itemsBruto, setItemsBruto] = useState<InventarioItem[]>([]);
  const [itemsProcesado, setItemsProcesado] = useState<InventarioItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showRecetasModal, setShowRecetasModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, r, bruto, procesado] = await Promise.all([
        inventarioService.getAllFichas(),
        inventarioService.getAllRecetas(),
        inventarioService.getAllBruto(),
        inventarioService.getAllProcesado()
      ]);
      setFichas(f);
      setRecetas(r);
      setItemsBruto(bruto);
      setItemsProcesado(procesado);
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

  const recetasAgrupadas = (recetas as any[]).reduce((acc: any, r: any) => {
    const prodName = r.producto?.nombre || 'Producto sin nombre';
    if (!acc[prodName]) acc[prodName] = [];
    acc[prodName].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-100">
            <Utensils size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relaciones y Recetas</h1>
            <p className="text-sm text-gray-500">Configuración inteligente de consumo y transformación</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowRecetasModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-orange-100 hover:bg-orange-600 active:scale-95"
            >
                <Settings size={18} />
                Gestionar Recetas
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
          key="recetas"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Fichas de Transformación */}
                <div className="xl:col-span-4 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><RefreshCw size={16}/></div>
                         <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Fichas de Transformación</h3>
                    </div>
                    <div className="space-y-3">
                        {fichas.length === 0 ? (
                            <div className="p-10 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 text-sm italic">No hay fichas</div>
                        ) : (fichas as any[]).map((f: any) => (
                            <div key={f.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-2">
                                    <div className="text-[11px] font-black text-gray-900 uppercase">{f.bruto?.nombre}</div>
                                    <ArrowRight size={12} className="text-blue-400" />
                                    <div className="text-[11px] font-black text-blue-600 uppercase">{f.procesado?.nombre}</div>
                                </div>
                                <div className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                                    1u = {f.cantidad_procesado}{f.procesado?.unidad_medida}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recetas Agrupadas */}
                <div className="xl:col-span-8 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"><Utensils size={16}/></div>
                         <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Recetas del Menú</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(recetasAgrupadas).length === 0 ? (
                            <div className="col-span-full p-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center text-gray-400 text-sm italic">No hay recetas configuradas</div>
                        ) : Object.entries(recetasAgrupadas).map(([producto, insumos]: [any, any]) => (
                            <motion.div 
                                key={producto}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-orange-100 transition-all"
                            >
                                <div className="p-5 bg-orange-50/50 border-b border-orange-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500"><Utensils size={20}/></div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase text-xs tracking-tighter">{producto}</h4>
                                        <p className="text-[9px] font-bold text-orange-600/60 uppercase">Consume {insumos.length} insumos</p>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3 flex-1 bg-white">
                                    {(insumos as any[]).map((r: any) => (
                                        <div key={r.id} className="flex items-center justify-between group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-40 group-hover/item:opacity-100 transition-opacity" />
                                                <span className="text-[10px] font-bold text-gray-600 group-hover/item:text-gray-900 transition-colors uppercase">{r.procesado?.nombre}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                                -{Number(r.cantidad).toFixed(2)} {r.procesado?.unidad_medida}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
      </AnimatePresence>

      <RecetasModal 
        open={showRecetasModal}
        bruto={itemsBruto}
        procesado={itemsProcesado}
        onClose={() => setShowRecetasModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default RecetasPage;
