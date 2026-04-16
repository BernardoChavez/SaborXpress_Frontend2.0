import { useEffect, useState } from 'react';
import { RefreshCw, ScrollText } from 'lucide-react';
import { bitacoraService } from '../bitacoraService';
import type { BitacoraEntry } from '../types/bitacora.types';

// ── Badge de método HTTP ───────────────────────────────────────────────────────
const methodColors: Record<string, string> = {
  POST:   'bg-green-100  text-green-700  border-green-200',
  PUT:    'bg-blue-100   text-blue-700   border-blue-200',
  PATCH:  'bg-blue-100   text-blue-700   border-blue-200',
  DELETE: 'bg-red-100    text-red-700    border-red-200',
  GET:    'bg-gray-100   text-gray-600   border-gray-200',
};

const extractMethod = (accion: string): string => {
  const method = (accion || '').split(' ')[0].toUpperCase();
  return method in methodColors ? method : 'GET';
};

const formatDate = (dateValue: string | null) => dateValue || '-';
const formatTime = (timeValue: string | null) => timeValue || '-';
const getResponsibleName = (entry: BitacoraEntry) =>
  entry.usuario?.persona?.nombre?.trim() || `Usuario #${entry.id_usuario}`;

// ── Componente principal ──────────────────────────────────────────────────────
const BitacoraPage = () => {
  const [entries, setEntries] = useState<BitacoraEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBitacora = async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await bitacoraService.getAll());
    } catch {
      setError('No se pudo cargar la bitácora.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBitacora(); }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <ScrollText size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Bitácora del sistema</h1>
            <p className="text-xs sm:text-sm text-gray-500">Historial de auditoría — Solo lectura</p>
          </div>
        </div>
        <button onClick={fetchBitacora} title="Recargar"
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-end sm:self-auto">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Registros de actividad</h2>
          {!loading && (
            <span className="text-xs text-gray-400">{entries.length} registros</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" />
            <span className="text-sm">Cargando bitácora…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <p className="text-4xl mb-2">⚠️</p>
            <p className="text-sm font-medium">{error}</p>
            <button onClick={fetchBitacora} className="mt-4 text-xs text-orange-500 hover:underline">Reintentar</button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-sm font-medium">La bitácora está vacía</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-3 sm:px-5 py-3">Nombre</th>
                  <th className="px-3 sm:px-5 py-3">Acción</th>
                  <th className="px-3 sm:px-5 py-3 min-w-[280px]">Detalle de acción</th>
                  <th className="px-3 sm:px-5 py-3 hidden md:table-cell">IP</th>
                  <th className="px-3 sm:px-5 py-3">Fecha</th>
                  <th className="px-3 sm:px-5 py-3">Hora inicio</th>
                  <th className="px-3 sm:px-5 py-3">Hora cierre</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const method = extractMethod(entry.accion);
                  return (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-slate-50/60 transition-colors align-top">
                      <td className="px-3 sm:px-5 py-3 text-gray-700 whitespace-nowrap">
                        {getResponsibleName(entry)}
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${methodColors[method]}`}>
                          {method}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-gray-600">
                        {entry.accion_detalle || 'Sin detalle'}
                      </td>
                      <td className="px-3 sm:px-5 py-3 font-mono text-xs text-gray-500 hidden md:table-cell">
                        {entry.ip || '-'}
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-gray-600 whitespace-nowrap text-xs">
                        {formatDate(entry.fecha)}
                      </td>
                      <td className="px-3 sm:px-5 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                        {formatTime(entry.hora_inicio)}
                      </td>
                      <td className="px-3 sm:px-5 py-3 font-mono text-xs whitespace-nowrap">
                        {entry.hora_cierre ? (
                          <span className="text-gray-600">{formatTime(entry.hora_cierre)}</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Activo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BitacoraPage;
