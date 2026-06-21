import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, RefreshCw, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { empresaService } from '../empresaService';
import type { Empresa } from '../types/empresa.types';

const EmpresaPage = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchEmpresa = async () => {
    setLoading(true);
    try {
      const data = await empresaService.get();
      setEmpresa(data);
    } catch {
      setError('Error al cargar datos de la empresa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmpresa(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    setSuccess(false);
    try {
      await empresaService.update(empresa);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="p-4 bg-gray-50 rounded-full animate-pulse">
          <RefreshCw size={32} className="animate-spin text-gray-400" />
        </div>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando Sistema...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Building2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 italic tracking-tight">DATOS DE LA EMPRESA</h1>
            <p className="text-sm text-gray-500 font-medium">Configura la información general de tu negocio y facturación</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-95"
        >
          {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar Cambios
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-emerald-100 shadow-sm shadow-emerald-50">
          <CheckCircle size={20} />
          ¡Configuración actualizada con éxito!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* BLOQUE 1: DATOS GENERALES */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Building2 size={18} />
            </div>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Información Pública</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nombre del Negocio <span className="text-red-500">*</span></label>
              <input required type="text" value={empresa?.nombre || ''} onChange={e => setEmpresa({...empresa!, nombre: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">NIT / Documento</label>
              <input type="text" value={empresa?.nit || ''} onChange={e => setEmpresa({...empresa!, nit: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono text-gray-900" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dirección Comercial</label>
              <input type="text" value={empresa?.direccion || ''} onChange={e => setEmpresa({...empresa!, direccion: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
              <input type="text" value={empresa?.telefono || ''} onChange={e => setEmpresa({...empresa!, telefono: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Moneda Base Sistema</label>
              <input required type="text" value={empresa?.moneda || ''} onChange={e => setEmpresa({...empresa!, moneda: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-black text-gray-900" placeholder="Ej: Bs. / $ / MXN" />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: FACTURACIÓN */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <div className="px-8 py-5 border-b border-gray-50 bg-orange-50/30 flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <FileText size={18} />
            </div>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Parámetros de Facturación</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sucursal</label>
              <input type="text" placeholder="Ej. CASA MATRIZ" value={empresa?.sucursal || ''} onChange={e => setEmpresa({...empresa!, sucursal: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ciudad Emisión</label>
              <input type="text" value={empresa?.ciudad || ''} onChange={e => setEmpresa({...empresa!, ciudad: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-900" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Actividad Económica Declarada</label>
              <input type="text" value={empresa?.actividad_economica || ''} onChange={e => setEmpresa({...empresa!, actividad_economica: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all text-gray-900" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                Código de Autorización (Impuestos)
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md text-[8px]">CRÍTICO</span>
              </label>
              <input type="text" value={empresa?.codigo_autorizacion || ''} onChange={e => setEmpresa({...empresa!, codigo_autorizacion: e.target.value})} className="w-full px-4 py-3 bg-slate-900 text-green-400 border border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-mono text-xs tracking-wider" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Leyenda Legal de la Factura (Ej. Ley N° 453)</label>
              <textarea rows={3} value={empresa?.leyenda_factura || ''} onChange={e => setEmpresa({...empresa!, leyenda_factura: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all resize-none text-xs text-gray-700 leading-relaxed"></textarea>
            </div>
          </div>
        </div>

        {/* BOTÓN FLOTANTE MÓVIL */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-20">
            <button type="submit" disabled={saving} className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl disabled:opacity-50 active:scale-95 transition-transform">
              {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              Guardar Cambios
            </button>
        </div>

      </form>
    </motion.div>
  );
};

export default EmpresaPage;
