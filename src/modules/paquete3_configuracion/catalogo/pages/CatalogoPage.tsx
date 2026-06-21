import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Pencil, Trash2, Tag, ShoppingBag, BookOpen } from 'lucide-react';
import axios from 'axios';
import { categoriaService, productoService } from '../catalogoService';
import type { Categoria, Producto, CreateCategoriaDto, CreateProductoDto } from '../types/catalogo.types';
import CategoriaModal from '../components/CategoriaModal';
import ProductoModal from '../components/ProductoModal';
import CatalogoDeleteModal from '../components/CatalogoDeleteModal';

type Tab = 'categorias' | 'productos';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'categorias', label: 'Categorías', icon: <Tag size={16} /> },
  { id: 'productos',  label: 'Productos',  icon: <ShoppingBag size={16} /> },
];

const CatalogoPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('categorias');

  // ── Categorías state ───────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catEditTarget, setCatEditTarget] = useState<Categoria | null>(null);
  const [catDeleteTarget, setCatDeleteTarget] = useState<Categoria | null>(null);

  // ── Productos state ────────────────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState<string | null>(null);
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [prodEditTarget, setProdEditTarget] = useState<Producto | null>(null);
  const [prodDeleteTarget, setProdDeleteTarget] = useState<Producto | null>(null);

  // ── Fetchers ───────────────────────────────────────────────────────────────
  const fetchCategorias = async () => {
    setCatLoading(true);
    setCatError(null);
    try {
      setCategorias(await categoriaService.getAll());
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setCatError(err.response?.data?.message || 'No se pudieron cargar las categorias.');
      } else {
        setCatError('No se pudieron cargar las categorias.');
      }
    }
    finally { setCatLoading(false); }
  };

  const fetchProductos = async () => {
    setProdLoading(true);
    setProdError(null);
    try {
      setProductos(await productoService.getAll());
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setProdError(err.response?.data?.message || 'No se pudieron cargar los productos.');
      } else {
        setProdError('No se pudieron cargar los productos.');
      }
    }
    finally { setProdLoading(false); }
  };

  useEffect(() => { fetchCategorias(); fetchProductos(); }, []);

  // ── Handlers categorías ────────────────────────────────────────────────────
  const handleCatSubmit = async (dto: CreateCategoriaDto, id?: number) => {
    if (id) await categoriaService.update(id, dto);
    else await categoriaService.create(dto);
    await fetchCategorias();
  };
  const handleCatDelete = async () => {
    if (catDeleteTarget) { await categoriaService.remove(catDeleteTarget.id); await fetchCategorias(); }
  };

  // ── Handlers productos ─────────────────────────────────────────────────────
  const handleProdSubmit = async (dto: CreateProductoDto, id?: number) => {
    if (id) await productoService.update(id, dto);
    else await productoService.create(dto);
    await fetchProductos();
  };
  const handleProdDelete = async () => {
    if (prodDeleteTarget) { await productoService.remove(prodDeleteTarget.id); await fetchProductos(); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <BookOpen size={20} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catálogo</h1>
          <p className="text-sm text-gray-500">Gestión de categorías y productos</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs bar */}
        <div className="flex border-b border-gray-100 px-1 pt-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === tab.id ? 'text-orange-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}{tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'categorias' && (
            <TabSection
              title="Categorías"
              count={categorias.length}
              loading={catLoading}
              error={catError}
              onRefresh={fetchCategorias}
              onAdd={() => { setCatEditTarget(null); setCatModalOpen(true); }}
              addLabel="Nueva categoría"
            >
              <SimpleTable
                headers={['ID', 'Nombre', 'Productos', 'Acciones']}
                empty={!catLoading && categorias.length === 0}
                emptyMsg="No hay categorías registradas"
              >
                {categorias.map(c => (
                  <tr key={c.id} className="hover:bg-orange-50/40 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {productos.filter(p => p.id_categoria === c.id).length} productos
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setCatEditTarget(c); setCatModalOpen(true); }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setCatDeleteTarget(c)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </SimpleTable>
            </TabSection>
          )}

          {activeTab === 'productos' && (
            <TabSection
              title="Productos"
              count={productos.length}
              loading={prodLoading}
              error={prodError}
              onRefresh={fetchProductos}
              onAdd={() => { setProdEditTarget(null); setProdModalOpen(true); }}
              addLabel="Nuevo producto"
            >
              <SimpleTable
                headers={['ID', 'Nombre', 'Categoría', 'Precio', 'Acciones']}
                empty={!prodLoading && productos.length === 0}
                emptyMsg="No hay productos registrados"
              >
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-orange-50/40 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">#{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        {p.categoria?.nombre ?? `Cat. ${p.id_categoria}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ${Number(p.precio_venta).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setProdEditTarget(p); setProdModalOpen(true); }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setProdDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </SimpleTable>
            </TabSection>
          )}
        </div>
      </div>

      {/* Modales */}
      <CategoriaModal open={catModalOpen} categoria={catEditTarget}
        onClose={() => setCatModalOpen(false)} onSubmit={handleCatSubmit} />
      <CatalogoDeleteModal open={!!catDeleteTarget} itemName={catDeleteTarget?.nombre ?? ''}
        onClose={() => setCatDeleteTarget(null)} onConfirm={handleCatDelete} />

      <ProductoModal open={prodModalOpen} producto={prodEditTarget} categorias={categorias}
        onClose={() => setProdModalOpen(false)} onSubmit={handleProdSubmit} />
      <CatalogoDeleteModal open={!!prodDeleteTarget} itemName={prodDeleteTarget?.nombre ?? ''}
        onClose={() => setProdDeleteTarget(null)} onConfirm={handleProdDelete} />
    </div>
  );
};

// ── Helpers de UI ──────────────────────────────────────────────────────────────
interface TabSectionProps {
  title: string; count: number; loading: boolean;
  error?: string | null;
  onRefresh: () => void; onAdd: () => void; addLabel: string;
  children: React.ReactNode;
}
const TabSection = ({ title, count, loading, error, onRefresh, onAdd, addLabel, children }: TabSectionProps) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <p className="text-xs sm:text-sm text-gray-500">{count} {title.toLowerCase()} registradas</p>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} title="Recargar"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={onAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-orange-200 transition-all hover:shadow-md hover:-translate-y-0.5">
          <Plus size={15} /><span className="hidden sm:inline">{addLabel}</span><span className="sm:hidden">Nuevo</span>
        </button>
      </div>
    </div>
    {loading ? (
      <div className="flex items-center justify-center py-14 text-gray-400">
        <RefreshCw size={20} className="animate-spin mr-2" /><span className="text-sm">Cargando…</span>
      </div>
    ) : error ? (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        {error}
      </div>
    ) : children}
  </div>
);

interface SimpleTableProps {
  headers: string[]; empty: boolean; emptyMsg: string; children: React.ReactNode;
}
const SimpleTable = ({ headers, empty, emptyMsg, children }: SimpleTableProps) => (
  empty ? (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-2">📦</p>
      <p className="text-sm font-medium">{emptyMsg}</p>
    </div>
  ) : (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
);

export default CatalogoPage;
