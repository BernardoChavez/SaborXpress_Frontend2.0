import { ShieldCheck, UtensilsCrossed, CreditCard } from 'lucide-react';
import type { Usuario, TipoUsuarioSistema } from '../types/usuario.types';

interface RoleCardProps {
  role: TipoUsuarioSistema;
  count: number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

const RoleCard = ({ role, count, description, icon, gradient, textColor }: RoleCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm border border-white/60`}>
    {/* Icon background */}
    <div className={`absolute -top-3 -right-3 w-20 h-20 rounded-full opacity-20 ${textColor} bg-current`} />

    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
          {role}
        </p>
        <p className={`text-4xl font-bold ${textColor}`}>{count}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${textColor} bg-current bg-opacity-10`}>
        <span className={textColor}>{icon}</span>
      </div>
    </div>
  </div>
);

interface RoleCardsProps {
  usuarios: Usuario[];
}

const roleConfig: Record<TipoUsuarioSistema, Omit<RoleCardProps, 'count' | 'role'>> = {
  Admin: {
    description: 'Acceso completo al sistema',
    icon: <ShieldCheck size={22} />,
    gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    textColor: 'text-purple-600',
  },
  Cajero: {
    description: 'Gestión de pedidos y pagos',
    icon: <CreditCard size={22} />,
    gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    textColor: 'text-blue-600',
  },
  Cocinero: {
    description: 'Preparación de órdenes',
    icon: <UtensilsCrossed size={22} />,
    gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
    textColor: 'text-orange-600',
  },
};

const RoleCards = ({ usuarios }: RoleCardsProps) => {
  const countByRole = (role: TipoUsuarioSistema) =>
    usuarios.filter((u) => u.tipo_usuario === role).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(Object.keys(roleConfig) as TipoUsuarioSistema[]).map((role) => (
        <RoleCard
          key={role}
          role={role}
          count={countByRole(role)}
          {...roleConfig[role]}
        />
      ))}
    </div>
  );
};

export default RoleCards;
