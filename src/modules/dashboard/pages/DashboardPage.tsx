import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Tag, ScrollText,
  TrendingUp, ShieldCheck, UtensilsCrossed, CreditCard,
  ArrowRight, Clock,
} from 'lucide-react';
import { useAuthStore } from '../../../core/store/useAuthStore';
import axiosInstance from '../../../api/axios';
import type { BitacoraEntry } from '../../bitacora/types/bitacora.types';

// ── Tipos locales ─────────────────────────────────────────────────────────────
interface Stats {
  usuarios: number;
  categorias: number;
  productos: number;
  bitacora: number;
}

interface UsuarioResumen {
  tipo_usuario: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

const timeAgo = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
};

const parseBitacoraDate = (entry: BitacoraEntry): Date | null => {
  if (!entry.fecha || !entry.hora_inicio) return null;
  const d = new Date(`${entry.fecha}T${entry.hora_inicio}`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const activityTimeLabel = (entry: BitacoraEntry): string => {
  const d = parseBitacoraDate(entry);
  if (d) return timeAgo(d);
  if (entry.fecha && entry.hora_inicio) return `${entry.fecha} · ${entry.hora_inicio}`;
  return '—';
};

const getResponsibleName = (entry: BitacoraEntry) =>
  entry.usuario?.persona?.nombre?.trim() || `Usuario #${entry.id_usuario}`;

const methodBadge: Record<string, string> = {
  POST: 'bg-green-100 text-green-700 border-green-200',
  PUT: 'bg-blue-100 text-blue-700 border-blue-200',
  PATCH: 'bg-blue-100 text-blue-700 border-blue-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  GET: 'bg-gray-100 text-gray-600 border-gray-200',
};

const extractMethod = (accion: string): string => {
  const m = (accion || '').split(' ')[0].toUpperCase();
  return m in methodBadge ? m : 'GET';
};

// ── Componente principal ──────────────────────────────────────────────────────
const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const tipoUsuario = useAuthStore((s) => s.tipo_usuario);
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({ usuarios: 0, categorias: 0, productos: 0, bitacora: 0 });
  const [recentActivity, setRecentActivity] = useState<BitacoraEntry[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Solo Admin puede ver todo; los demás ven datos parciales
        if (tipoUsuario === 'Admin') {
          const [usersRes, catsRes, prodsRes, bitRes] = await Promise.allSettled([
            axiosInstance.get('/usuarios'),
            axiosInstance.get('/categorias'),
            axiosInstance.get('/productos'),
            axiosInstance.get('/bitacora'),
          ]);

          const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
          const cats = catsRes.status === 'fulfilled' ? catsRes.value.data : [];
          const prods = prodsRes.status === 'fulfilled' ? prodsRes.value.data : [];
          const bits = bitRes.status === 'fulfilled' ? bitRes.value.data : [];

          setStats({
            usuarios: users.length,
            categorias: cats.length,
            productos: prods.length,
            bitacora: bits.length,
          });

          // Últimas 8 actividades
          setRecentActivity(bits.slice(0, 8));

          // Conteo por rol
          const counts: Record<string, number> = {};
          users.forEach((u: UsuarioResumen) => {
            counts[u.tipo_usuario] = (counts[u.tipo_usuario] || 0) + 1;
          });
          setRoleCounts(counts);
        } else {
          // Usuarios no-admin: solo productos y categorías
          const [catsRes, prodsRes] = await Promise.allSettled([
            axiosInstance.get('/categorias'),
            axiosInstance.get('/productos'),
          ]);
          const cats = catsRes.status === 'fulfilled' ? catsRes.value.data : [];
          const prods = prodsRes.status === 'fulfilled' ? prodsRes.value.data : [];
          setStats((s) => ({ ...s, categorias: cats.length, productos: prods.length }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [tipoUsuario]);

  const isAdmin = tipoUsuario === 'Admin';

  // ── Tarjetas de resumen ─────────────────────────────────────────────────────
  const summaryCards = [
    ...(isAdmin ? [{
      label: 'Usuarios', value: stats.usuarios, icon: <Users size={22} />,
      gradient: 'from-purple-500 to-purple-700', link: '/admin/usuarios',
    }] : []),
    {
      label: 'Categorías', value: stats.categorias, icon: <Tag size={22} />,
      gradient: 'from-orange-400 to-orange-600', link: isAdmin ? '/admin/catalogo' : undefined,
    },
    {
      label: 'Productos', value: stats.productos, icon: <ShoppingBag size={22} />,
      gradient: 'from-emerald-500 to-emerald-700', link: isAdmin ? '/admin/catalogo' : undefined,
    },
    ...(isAdmin ? [{
      label: 'Registros', value: stats.bitacora, icon: <ScrollText size={22} />,
      gradient: 'from-slate-500 to-slate-700', link: '/admin/bitacora',
    }] : []),
  ];

  // ── Role config ─────────────────────────────────────────────────────────────
  const roleConfig: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
    Admin: { icon: <ShieldCheck size={20} />, color: 'text-purple-600 bg-purple-100', desc: 'Acceso total' },
    Cajero: { icon: <CreditCard size={20} />, color: 'text-blue-600 bg-blue-100', desc: 'Pedidos y pagos' },
    Cocinero: { icon: <UtensilsCrossed size={20} />, color: 'text-orange-600 bg-orange-100', desc: 'Preparación' },
  };

  return (
    <div className="space-y-6">
      {/* ── Bienvenida ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.persona?.nombre ?? 'Usuario'} 
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Aquí tienes un resumen de tu sistema SaborXpress
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <Clock size={14} />
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* ── Tarjetas resumen ───────────────────────────────────────────────── */}
      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            onClick={() => card.link && navigate(card.link)}
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.link ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all' : ''}`}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-white/20">{card.icon}</span>
                {card.link && <ArrowRight size={16} className="opacity-60" />}
              </div>
              <p className="text-3xl font-bold">
                {loading ? '…' : card.value}
              </p>
              <p className="text-sm opacity-80 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid inferior ──────────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad reciente (2/3) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-800">Actividad reciente</h2>
              </div>
              <button
                onClick={() => navigate('/admin/bitacora')}
                className="text-xs text-orange-500 hover:text-orange-700 font-medium transition-colors"
              >
                Ver todo →
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                Cargando…
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Sin actividad registrada
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentActivity.map((entry) => {
                  const method = extractMethod(entry.accion);
                  const badge = methodBadge[method] ?? methodBadge.GET;
                  const detalle = entry.accion_detalle?.trim() || 'Sin detalle';
                  const nombre = getResponsibleName(entry);
                  return (
                    <li
                      key={entry.id}
                      className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span
                            className={`shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border ${badge}`}
                          >
                            {method}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm text-gray-900 leading-snug line-clamp-2">
                              {detalle}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium text-gray-600">{nombre}</span>
                              {entry.ip ? (
                                <>
                                  <span className="mx-1.5 text-gray-300">·</span>
                                  <span className="font-mono text-gray-400">{entry.ip}</span>
                                </>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 sm:text-right pl-11 sm:pl-0">
                          <p className="text-xs font-medium text-gray-500 tabular-nums">
                            {activityTimeLabel(entry)}
                          </p>
                          {entry.hora_cierre == null ? (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Activo</p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Desglose por rol (1/3) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Usuarios por rol</h2>
            </div>
            <div className="p-4 space-y-3">
              {Object.entries(roleConfig).map(([role, cfg]) => (
                <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cfg.color}`}>{cfg.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{role}</p>
                      <p className="text-xs text-gray-400">{cfg.desc}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {loading ? '…' : (roleCounts[role] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
