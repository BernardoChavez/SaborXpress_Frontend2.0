import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Lock, 
  Unlock, 
  RefreshCw,
  TrendingUp,
  QrCode,
  Banknote,
  ShieldCheck,
  DoorOpen,
  Power,
  CheckCircle2,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { cajaService } from '../services/cajaService';
import type { Caja } from '../services/cajaService';
import { ventaService } from '../services/ventaService';
import EgresoCajaModal from '../components/EgresoCajaModal';
import TicketModal from '../components/TicketModal';

const CajaPage = () => {
    const [caja, setCaja] = useState<Caja | null>(null);
    const [ventas, setVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEgresoModal, setShowEgresoModal] = useState(false);
    
    // Estados para Ticket de Re-impresión (CU25)
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketText, setTicketText] = useState('');

    // Estados para Apertura
    const [aperturaEfectivo, setAperturaEfectivo] = useState('0');
    const [aperturaQR, setAperturaQR] = useState('0');
    
    // Estados para Cierre
    const [montoReal, setMontoReal] = useState('');
    const [montoRealQR, setMontoRealQR] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    const [reporteCierre, setReporteCierre] = useState<any>(null);

    const loadCaja = async () => {
        setLoading(true);
        try {
            const data = await cajaService.getEstado();
            setCaja(data.caja);
            
            // Cargar ventas del turno (últimas 50)
            const sales = await ventaService.getVentas();
            setVentas(sales);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCaja();
    }, []);

    const handleAbrirCaja = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await cajaService.abrir(Number(aperturaEfectivo), Number(aperturaQR));
            await loadCaja();
            setReporteCierre(null);
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error al abrir caja');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCerrarCaja = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const reporte = await cajaService.cerrar(Number(montoReal), Number(montoRealQR));
            setReporteCierre(reporte);
            await loadCaja();
            setMontoReal('');
            setMontoRealQR('');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Error al cerrar caja');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerTicket = async (id: number) => {
        try {
            const data = await ventaService.getTicket(id);
            if (data && data.ticket_text) {
                setTicketText(data.ticket_text);
                setShowTicketModal(true);
            } else {
                alert('No se pudo obtener el ticket');
            }
        } catch (e) {
            alert('Error al obtener el ticket');
        }
    };

    if (loading && !caja) return <div className="p-8 text-center font-bold text-gray-500 animate-pulse">Cargando estado de caja...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Gestión de Caja</h1>
                    <p className="text-gray-500">Control de flujo diario y conciliación bancaria</p>
                </div>
                <div className="flex items-center gap-3">
                    {caja?.estado === 'Abierta' && (
                        <button
                            onClick={() => setShowEgresoModal(true)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100"
                        >
                            <Plus size={14} />
                            Registrar Egreso
                        </button>
                    )}
                    <div className={`px-4 py-2 rounded-2xl font-black text-xs uppercase flex items-center gap-2 ${caja?.estado === 'Abierta' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {caja?.estado === 'Abierta' ? <Unlock size={14}/> : <Lock size={14}/>}
                        Caja {caja?.estado || 'Cerrada'}
                    </div>
                </div>
            </div>

            {caja?.estado === 'Abierta' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Apertura card */}
                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-gray-500"><DoorOpen size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Base Apertura</span></div>
                        <div className="space-y-4">
                            <div><p className="text-[8px] font-black text-gray-400 uppercase">Efectivo</p><p className="text-2xl font-black text-gray-800">Bs. {Number(caja.monto_apertura).toLocaleString()}</p></div>
                            <div className="pt-2 border-t border-gray-200"><p className="text-[8px] font-black text-gray-400 uppercase">QR (Banco)</p><p className="text-2xl font-black text-gray-800">Bs. {Number(caja.monto_apertura_qr).toLocaleString()}</p></div>
                        </div>
                    </div>

                    {/* Ingresos efectivo */}
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-blue-500"><Banknote size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Ingresos Efectivo</span></div>
                        <h2 className="text-4xl font-black text-blue-600">Bs. {(caja.ventas_efectivo || 0).toLocaleString()}</h2>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Recaudado hoy en gaveta</p>
                    </div>

                    {/* Ingresos QR */}
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-purple-500"><QrCode size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Ingresos QR</span></div>
                        <h2 className="text-4xl font-black text-purple-600">Bs. {(caja.ventas_qr || 0).toLocaleString()}</h2>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Recaudado hoy en banco</p>
                    </div>

                    {/* Egresos Caja Chica */}
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-red-500"><ArrowUpRight size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Egresos Caja Chica</span></div>
                        <h2 className="text-4xl font-black text-red-600">Bs. {(caja.egresos || 0).toLocaleString()}</h2>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Salidas de caja registradas</p>
                    </div>

                    {/* Venta Neta */}
                    <div className="lg:col-span-1 bg-gray-900 p-6 rounded-[32px] text-white shadow-xl shadow-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-orange-400"><TrendingUp size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Venta Neta Total</span></div>
                        <h2 className="text-4xl font-black">Bs. {(caja.ventas_totales || 0).toLocaleString()}</h2>
                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase italic">Ventas brutas del día</p>
                    </div>

                    {/* Expected balances */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-orange-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                            <p className="text-xs font-bold text-orange-300 uppercase mb-2 tracking-widest">Saldo en Gaveta Esperado</p>
                            <h3 className="text-6xl font-black">Bs. {Number(caja.monto_esperado_efectivo).toLocaleString()}</h3>
                            <p className="text-[10px] text-orange-300/40 mt-4 font-bold uppercase tracking-widest italic">Base Inicial + Ventas Efectivo - Egresos</p>
                        </div>
                        <div className="bg-indigo-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                            <p className="text-xs font-bold text-indigo-300 uppercase mb-2 tracking-widest">Saldo en Banco Esperado</p>
                            <h3 className="text-6xl font-black">Bs. {(Number(caja.monto_apertura_qr) + (caja.ventas_qr || 0)).toLocaleString()}</h3>
                            <p className="text-[10px] text-indigo-300/40 mt-4 font-bold uppercase tracking-widest italic">Base Banco + Ventas QR</p>
                        </div>
                    </div>

                    {/* Ventas Recientes (CU25) */}
                    <div className="lg:col-span-3 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase italic flex items-center gap-2"><TrendingUp size={20} className="text-orange-500"/> Ventas Recientes</h3>
                            <button onClick={loadCaja} className="text-xs font-bold text-orange-500 hover:text-orange-600">Actualizar</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                        <th className="p-3">Pedido</th>
                                        <th className="p-3">Hora</th>
                                        <th className="p-3">Monto</th>
                                        <th className="p-3">Método</th>
                                        <th className="p-3">Comanda</th>
                                        <th className="p-3 text-right">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-xs">
                                    {ventas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-gray-400 italic">No hay ventas registradas hoy.</td>
                                        </tr>
                                    ) : (
                                        ventas.map((v: any) => (
                                            <tr key={v.id} className="hover:bg-gray-50/50">
                                                <td className="p-3 font-black text-gray-900">#{String(v.nro_pedido).padStart(3, '0')}</td>
                                                <td className="p-3 text-gray-400">{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="p-3 font-bold text-gray-800">Bs. {Number(v.monto_total).toFixed(2)}</td>
                                                <td className="p-3 text-gray-500 font-medium">{v.metodo_pago}</td>
                                                <td className="p-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                                        v.VentaEstado === 'Listo' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                    }`}>
                                                        {v.VentaEstado || 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleVerTicket(v.id)}
                                                        className="px-2.5 py-1.5 bg-gray-900 hover:bg-orange-500 text-white font-black text-[9px] uppercase rounded-lg transition-colors"
                                                    >
                                                        Ticket
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <form onSubmit={handleCerrarCaja} className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-gray-100 space-y-6">
                            <h4 className="text-lg font-black uppercase italic flex items-center gap-2"><Calculator size={20} className="text-orange-500"/> Hacer Arqueo</h4>
                            <div className="space-y-4">
                                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efectivo Real en Mano</label><input required type="number" step="0.01" value={montoReal} onChange={e => setMontoReal(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:border-orange-500 outline-none" /></div>
                                <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">QR Verificado en Banco</label><input required type="number" step="0.01" value={montoRealQR} onChange={e => setMontoRealQR(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:border-indigo-500 outline-none" /></div>
                            </div>
                            <button disabled={submitting} type="submit" className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-3xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200">CERRAR TURNO</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
                    <div className="space-y-8">
                        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 shadow-inner"><Lock size={40} /></div>
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black text-gray-900 leading-tight tracking-tight">Caja <span className="text-red-500">Inactiva</span></h2>
                            <p className="text-xl text-gray-500 leading-relaxed max-w-md">Inicia un nuevo turno para habilitar el <span className="font-bold text-orange-500 italic underline decoration-orange-200">Punto de Venta</span> y registrar ingresos.</p>
                        </div>
                        
                        <div className="flex gap-4 p-6 bg-blue-50 rounded-[32px] border border-blue-100 text-blue-700 shadow-sm shadow-blue-100/50">
                             <ShieldCheck className="shrink-0 text-blue-500" />
                             <p className="text-sm font-medium">Al abrir caja, los montos de apertura servirán como base para el arqueo de cierre al final del turno.</p>
                        </div>
                    </div>

                    <motion.form 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleAbrirCaja}
                        className="bg-white p-12 rounded-[60px] shadow-2xl border-2 border-gray-100 space-y-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><Power size={24} /></div>
                            <h3 className="text-3xl font-black italic tracking-tight">Apertura de Turno</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-green-500 transition-colors"><Banknote size={14}/> Efectivo de Apertura (Base)</label>
                                <input required type="number" step="0.01" value={aperturaEfectivo} onChange={e => setAperturaEfectivo(e.target.value)} className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-4xl font-black focus:border-orange-500 outline-none transition-all shadow-sm group-focus-within:shadow-orange-100" />
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-purple-500 transition-colors"><QrCode size={14}/> Saldo en Banco (QR) al Iniciar</label>
                                <input required type="number" step="0.01" value={aperturaQR} onChange={e => setAperturaQR(e.target.value)} className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-4xl font-black focus:border-purple-500 outline-none transition-all shadow-sm group-focus-within:shadow-purple-100" />
                            </div>
                        </div>

                        <button disabled={submitting} type="submit" className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-[32px] shadow-2xl shadow-orange-500/40 transition-all active:scale-95 text-xl flex items-center justify-center gap-3 uppercase tracking-tighter">
                            {submitting ? <RefreshCw className="animate-spin" /> : 'HABILITAR PUNTO DE VENTA'}
                        </button>
                    </motion.form>
                </div>
            )}

            {reporteCierre && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-8 rounded-[50px] text-white shadow-3xl relative overflow-hidden border border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        
                        {/* Efectivo */}
                        <div className="lg:col-span-4 space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                <Banknote size={16}/><h5 className="text-[10px] font-black uppercase tracking-widest">Arqueo Efectivo</h5>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase"><span>Esperado</span> <span>Bs. {Number(reporteCierre.monto_esperado_fisico).toLocaleString()}</span></div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase"><span>Físico Real</span> <span>Bs. {Number(reporteCierre.monto_real_fisico).toLocaleString()}</span></div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase"><span>Total Egresos</span> <span>Bs. {Number(reporteCierre.total_egresos || 0).toLocaleString()}</span></div>
                                <div className={`flex justify-between items-center pt-2 border-t border-white/10 ${reporteCierre.diferencia_efectivo < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    <span className="text-[10px] font-black uppercase">Balance</span>
                                    <span className="text-2xl font-black">Bs. {Number(reporteCierre.diferencia_efectivo).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* QR */}
                        <div className="lg:col-span-4 space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                <QrCode size={16}/><h5 className="text-[10px] font-black uppercase tracking-widest">Arqueo QR (Banco)</h5>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase"><span>Esperado</span> <span>Bs. {Number(reporteCierre.monto_esperado_qr).toLocaleString()}</span></div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase"><span>Banco Real</span> <span>Bs. {Number(reporteCierre.monto_real_qr).toLocaleString()}</span></div>
                                <div className={`flex justify-between items-center pt-2 border-t border-white/10 ${reporteCierre.diferencia_qr < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    <span className="text-[10px] font-black uppercase">Balance</span>
                                    <span className="text-2xl font-black">Bs. {Number(reporteCierre.diferencia_qr).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Utilidad Central */}
                        <div className="lg:col-span-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
                                <TrendingUp size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Utilidad Real Turno</p>
                            <h4 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tighter">
                                Bs. {Number(reporteCierre.total_ingresos).toLocaleString()}
                            </h4>
                            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle2 size={12}/> Turno Conciliado
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}

            <EgresoCajaModal 
                isOpen={showEgresoModal}
                onClose={() => setShowEgresoModal(false)}
                onSuccess={loadCaja}
            />

            <TicketModal 
                isOpen={showTicketModal}
                onClose={() => { setShowTicketModal(false); setTicketText(''); }}
                ticketText={ticketText}
            />
        </div>
    );
};

export default CajaPage;
