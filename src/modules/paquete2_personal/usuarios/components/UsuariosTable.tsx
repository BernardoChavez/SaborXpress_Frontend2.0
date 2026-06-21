import { Pencil, Trash2 } from 'lucide-react';
import type { Usuario, TipoUsuarioSistema } from '../types/usuario.types';

const roleBadge: Record<TipoUsuarioSistema, string> = {
  Admin:    'bg-purple-100 text-purple-700 border-purple-200',
  Cajero:   'bg-blue-100   text-blue-700   border-blue-200',
  Cocinero: 'bg-orange-100 text-orange-700 border-orange-200',
};

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEdit: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
}

const UsuariosTable = ({ usuarios, onEdit, onDelete }: UsuariosTableProps) => {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-3">👤</p>
        <p className="font-medium">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-3 sm:px-5 py-3 rounded-tl-xl">ID</th>
            <th className="px-3 sm:px-5 py-3">Nombre</th>
            <th className="px-3 sm:px-5 py-3 hidden md:table-cell">Correo</th>
            <th className="px-3 sm:px-5 py-3 hidden lg:table-cell">Teléfono</th>
            <th className="px-3 sm:px-5 py-3">Rol</th>
            <th className="px-3 sm:px-5 py-3 text-center rounded-tr-xl">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {usuarios.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-orange-50/40 transition-colors group"
            >
              <td className="px-3 sm:px-5 py-3.5 font-mono text-gray-400 text-xs">#{u.id}</td>
              <td className="px-3 sm:px-5 py-3.5 font-medium text-gray-900">{u.persona.nombre}</td>
              <td className="px-3 sm:px-5 py-3.5 text-gray-600 hidden md:table-cell">{u.correo}</td>
              <td className="px-3 sm:px-5 py-3.5 text-gray-500 hidden lg:table-cell">{u.persona.telefono}</td>
              <td className="px-3 sm:px-5 py-3.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge[u.tipo_usuario]}`}
                >
                  {u.tipo_usuario}
                </span>
              </td>
              <td className="px-3 sm:px-5 py-3.5">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(u)}
                    title="Editar"
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    title="Eliminar"
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosTable;
