import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, Minus, Trash2, ChevronRight, Loader, QrCode, Upload, CheckCircle2, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriaService, productoService } from '../../paquete3_configuracion/catalogo/catalogoService';
import { ventaService } from '../../paquete5_ventas/ventas/services/ventaService';
import type { Categoria, Producto } from '../../paquete3_configuracion/catalogo/types/catalogo.types';
import TicketModal from '../../paquete5_ventas/ventas/components/TicketModal';
import { useNavigate } from 'react-router-dom';

interface CartItem extends Producto {
  cantidad: number;
}

const ClienteComprarPage = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [comprobanteName, setComprobanteName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Ticket (CU22)
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketText, setTicketText] = useState('');

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        categoriaService.getAll(),
        productoService.getAll()
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (prod: Producto) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === prod.id);
      if (exists) return prev.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.cantidad === 1 && delta === -1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + delta } : i);
    });
  };

  const total = cart.reduce((sum, i) => sum + (Number(i.precio_venta) * i.cantidad), 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setComprobanteFile(file);
      setComprobanteName(file.name);
    }
  };

  const handleEnviarPedido = async () => {
    if (!comprobanteName) return;
    setSubmitting(true);
    try {
      // Registrar venta: es ONLINE por lo que es tipo_entrega = 'Llevar' y metodo_pago = 'QR' obligatoriamente
      const res = await ventaService.registrar({
        metodo_pago: 'QR',
        tipo_entrega: 'Llevar',
        codigo_qr: comprobanteName, // Guardamos el nombre del comprobante subido
        detalles: cart.map(i => ({
          id_producto: i.id,
          cantidad: i.cantidad,
          precio_unitario: Number(i.precio_venta)
        })),
        VentaEstado: 'Pendiente'
      });

      // Obtener ticket de comanda (CU22)
      try {
        const ticketData = await ventaService.getTicket(res.venta.id);
        if (ticketData && ticketData.ticket_text) {
          setTicketText(ticketData.ticket_text);
          setShowTicketModal(true);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
      }

      setCart([]);
      setShowCheckout(false);
      setComprobanteFile(null);
      setComprobanteName('');
    } catch (e) {
      alert('Error al enviar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProds = productos.filter(p => {
    const matchesCat = selectedCat === 'all' || p.id_categoria === selectedCat;
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 overflow-hidden">
      
      {/* ── Products Grid ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="space-y-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="¿Qué deseas comer hoy?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-3xl shadow-sm focus:border-orange-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedCat('all')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCat === 'all' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>Todos</button>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>{cat.nombre}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
            {filteredProds.map((prod: any) => (
              <motion.div key={prod.id} whileTap={{ scale: 0.96 }} onClick={() => addToCart(prod)} className="bg-white p-4 rounded-[32px] border-2 border-transparent hover:border-orange-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                  {prod.imagen_url ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={40} /></div>}
                </div>
                <h3 className="font-black text-gray-900 text-sm leading-tight mb-2 truncate uppercase">{prod.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-black text-lg">Bs. {Number(prod.precio_venta).toFixed(2)}</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100"><Plus size={20} strokeWidth={3} /></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cart Sidebar ────────────────────────────────────────────────── */}
      <div className="w-[380px] bg-white rounded-[40px] shadow-2xl border border-gray-100 flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100"><ShoppingBag size={20} /></div>
            <div><h2 className="font-black text-gray-900 italic uppercase text-sm">Mi Carrito</h2></div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <ShoppingBag size={64} className="mb-4" />
              <p className="font-black uppercase italic text-xs">Agrega algún producto...</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cart.map((item: any) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl group">
                  <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 shrink-0 overflow-hidden">
                    {item.imagen_url ? <img src={item.imagen_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Utensils size={14}/></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[10px] font-black text-gray-900 truncate uppercase mb-1">{item.nombre}</h4>
                    <p className="text-[10px] font-bold text-orange-500">Bs. {(Number(item.precio_venta) * item.cantidad).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-all"><Minus size={12}/></button>
                    <span className="text-xs font-black w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition-all"><Plus size={12}/></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-6 bg-gray-900 text-white space-y-4">
          <div className="flex justify-between items-end">
            <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total del Pedido</p><span className="text-3xl font-black italic">Bs. {total.toFixed(2)}</span></div>
          </div>
          <button disabled={cart.length === 0} onClick={() => setShowCheckout(true)} className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">PAGAR PEDIDO <ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ── Checkout QR Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col p-8">
              
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black italic uppercase text-slate-800">PAGO POR QR SIMPLE</h3>
                  <p className="text-xs text-slate-500 font-medium">Escanea el código QR, realiza la transferencia y sube tu comprobante de pago.</p>
                </div>

                {/* QR Code Mock */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center max-w-xs mx-auto space-y-3">
                  <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-md relative overflow-hidden">
                    <QrCode size={140} className="text-slate-800" />
                    <div className="absolute w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black italic text-xs shadow-md">SX</div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sabor Xpress S.R.L.</p>
                  <p className="text-lg font-black text-orange-600">Bs. {total.toFixed(2)}</p>
                </div>

                {/* Image Upload Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subir Comprobante de Pago (Obligatorio)</label>
                  
                  <div className={`relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center transition-all ${
                    comprobanteName ? 'border-green-400 bg-green-50/20' : 'border-slate-200 hover:border-orange-300'
                  }`}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    
                    {comprobanteName ? (
                      <div className="flex flex-col items-center space-y-2 text-green-600">
                        <CheckCircle2 size={32} />
                        <span className="text-xs font-black uppercase tracking-wider">¡Comprobante Cargado!</span>
                        <span className="text-[10px] font-bold text-slate-500">{comprobanteName}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 text-slate-400">
                        <Upload size={32} />
                        <span className="text-xs font-bold">Haz clic o arrastra una imagen aquí</span>
                        <span className="text-[9px] font-medium">Formatos soportados: JPG, PNG</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowCheckout(false)} className="px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest">Atrás</button>
                  <button 
                    disabled={submitting || !comprobanteName} 
                    onClick={handleEnviarPedido} 
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase italic text-xs"
                  >
                    {submitting ? <Loader className="animate-spin size-4" /> : 'CONFIRMAR Y ENVIAR PEDIDO'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TicketModal 
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          // Redirigir a "Mis Pedidos" después de cerrar el ticket
          navigate('/cliente/notificaciones');
        }}
        ticketText={ticketText}
      />
    </div>
  );
};

export default ClienteComprarPage;
