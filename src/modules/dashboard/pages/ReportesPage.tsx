import { useState } from 'react';
import {
  FileSpreadsheet, TrendingUp, Package, Download, Calendar, ArrowLeft, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axios';

const ReportesPage = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState<{ type: 'ventas' | 'inventario'; format: 'csv' | 'pdf' } | null>(null);
  
  // Filtros de fecha para reporte de ventas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const downloadReport = async (type: 'ventas' | 'inventario', format: 'csv' | 'pdf') => {
    setDownloading({ type, format });
    try {
      let url = `/reportes/${type}`;
      if (format === 'pdf') {
        url += '/pdf';
      }
      
      // Adjuntar filtros de fecha si es reporte de ventas y están definidos
      if (type === 'ventas') {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        const queryString = params.toString();
        if (queryString) {
          url += `${format === 'pdf' ? '?' : '&'}${queryString}`;
        }
      }

      const response = await axiosInstance.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' 
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const dateStr = new Date().toISOString().split('T')[0];
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      const filename = type === 'ventas' 
        ? `reporte_ventas_${fechaInicio || 'inicio'}_a_${fechaFin || dateStr}.${ext}`
        : `reporte_inventario_${dateStr}.${ext}`;
        
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error downloading ${type} ${format} report:`, error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-orange-500 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Volver al Inicio
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Reportes</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Administración</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
            PANEL DE <span className="text-orange-500">REPORTES</span>
          </h1>
        </div>
      </div>

      {/* ── Contenido de Reportes ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Descarga de Comprobantes Gerenciales</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Exportación de datos del sistema POS en formato CSV tabulado compatible con Excel</p>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta de Ventas con Filtros */}
          <div className="group relative overflow-hidden rounded-[32px] p-6 border border-gray-100 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 opacity-[0.02] rounded-bl-[80px] transition-all group-hover:opacity-[0.05]" />
            <div className="relative z-10 space-y-6">
              <div>
                <div className="p-3 w-fit rounded-2xl bg-orange-100 text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Movimientos de Caja y Ventas</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Consolida la información de transacciones realizadas en el POS. Incluye montos de venta, métodos de pago, cajeros y fecha.
                </p>
              </div>

              {/* Filtros de Fecha */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <Calendar size={12} className="text-orange-500" />
                  Filtrar por Rango de Fechas
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Desde</label>
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/50 focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hasta</label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/50 focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
                {(fechaInicio || fechaFin) && (
                  <button
                    onClick={() => { setFechaInicio(''); setFechaFin(''); }}
                    className="text-[9px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest block ml-auto mt-1"
                  >
                    Limpiar Filtro
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
              <button
                onClick={() => downloadReport('ventas', 'csv')}
                disabled={downloading !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md disabled:opacity-50"
              >
                <FileSpreadsheet size={14} className={downloading?.type === 'ventas' && downloading?.format === 'csv' ? 'animate-bounce' : ''} />
                {downloading?.type === 'ventas' && downloading?.format === 'csv' ? 'Generando...' : 'Descargar Excel'}
              </button>
              <button
                onClick={() => downloadReport('ventas', 'pdf')}
                disabled={downloading !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md disabled:opacity-50"
              >
                <FileText size={14} className={downloading?.type === 'ventas' && downloading?.format === 'pdf' ? 'animate-bounce' : ''} />
                {downloading?.type === 'ventas' && downloading?.format === 'pdf' ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

          {/* Tarjeta de Inventarios */}
          <div className="group relative overflow-hidden rounded-[32px] p-6 border border-gray-100 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-[0.02] rounded-bl-[80px] transition-all group-hover:opacity-[0.05]" />
            <div className="relative z-10 space-y-6">
              <div>
                <div className="p-3 w-fit rounded-2xl bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Stock e Inventarios</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Exporta los niveles actuales de stock físico de materias primas y productos procesados. Incluye información de stock mínimo e insumos en estado crítico de abastecimiento.
                </p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex flex-col justify-center h-28 text-center text-xs font-bold italic text-slate-400">
                Todo el inventario consolidado (materia prima y procesados cocina) en una única hoja de datos.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
              <button
                onClick={() => downloadReport('inventario', 'csv')}
                disabled={downloading !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md disabled:opacity-50"
              >
                <FileSpreadsheet size={14} className={downloading?.type === 'inventario' && downloading?.format === 'csv' ? 'animate-bounce' : ''} />
                {downloading?.type === 'inventario' && downloading?.format === 'csv' ? 'Generando...' : 'Descargar Excel'}
              </button>
              <button
                onClick={() => downloadReport('inventario', 'pdf')}
                disabled={downloading !== null}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-md disabled:opacity-50"
              >
                <FileText size={14} className={downloading?.type === 'inventario' && downloading?.format === 'pdf' ? 'animate-bounce' : ''} />
                {downloading?.type === 'inventario' && downloading?.format === 'pdf' ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
