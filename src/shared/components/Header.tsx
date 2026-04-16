import { LogOut, UserCircle2 } from 'lucide-react';
import type { User } from '../../core/types/auth.types';

const roleBadgeColor: Record<string, string> = {
  admin:       'bg-purple-100 text-purple-700',
  cliente:     'bg-emerald-100 text-emerald-700',
  repartidor:  'bg-blue-100 text-blue-700',
};

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const badgeClass =
    (user?.tipo_usuario && roleBadgeColor[user.tipo_usuario]) ??
    'bg-gray-100 text-gray-600';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: espacio para el botón hamburguesa en móvil */}
      <div className="w-10 md:w-0" />

      {/* Right: user info */}
      <div className="flex items-center gap-2 sm:gap-3">
        <UserCircle2 size={28} className="text-slate-400 hidden sm:block" />
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-none">{user?.persona?.nombre ?? '—'}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${badgeClass}`}>
            {user?.tipo_usuario ?? ''}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={onLogout}
          title="Cerrar sesión"
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
