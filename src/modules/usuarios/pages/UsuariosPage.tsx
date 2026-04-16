import { useEffect, useState } from 'react';
import { UserPlus, RefreshCw, Users } from 'lucide-react';
import { usuarioService } from '../usuarioService';
import type { Usuario, CreateUsuarioDto } from '../types/usuario.types';
import RoleCards from '../components/RoleCards';
import UsuariosTable from '../components/UsuariosTable';
import UsuarioModal from '../components/UsuarioModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Usuario | null>(null);

  // Modal eliminar
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditTarget(u);
    setModalOpen(true);
  };

  const handleOpenDelete = (u: Usuario) => {
    setDeleteTarget(u);
    setDeleteOpen(true);
  };

  const handleSubmit = async (dto: CreateUsuarioDto, id?: number) => {
    if (id) {
      await usuarioService.update(id, dto);
    } else {
      await usuarioService.create(dto);
    }
    await fetchUsuarios();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await usuarioService.remove(deleteTarget.id);
    await fetchUsuarios();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users size={20} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsuarios}
            title="Recargar"
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            id="btn-crear-usuario"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-orange-200 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <UserPlus size={16} />
            <span className="hidden xs:inline sm:inline">Crear usuario</span>
          </button>
        </div>
      </div>

      {/* ── Role cards ───────────────────────────────────────────────────── */}
      {!loading && <RoleCards usuarios={usuarios} />}

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Lista de usuarios</h2>
          <span className="text-xs text-gray-400">{new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw size={22} className="animate-spin mr-2" />
            <span className="text-sm">Cargando usuarios...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <p className="text-4xl mb-2">⚠️</p>
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchUsuarios}
              className="mt-4 text-xs text-orange-500 hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────── */}
      <UsuarioModal
        open={modalOpen}
        usuario={editTarget}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        usuario={deleteTarget}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UsuariosPage;
