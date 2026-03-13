import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import type {
  CategoriesDetailsDTO,
  Category,
} from '../types/categories';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<CategoriesDetailsDTO>(
        '/admin/categories',
      );
      setCategories(response.categorias ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categorias.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await apiClient.post('/admin/categories', {
        name: newCategoryName.trim(),
      });
      setNewCategoryName('');
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar categoria.',
      );
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleSaveEdit = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    try {
      await apiClient.patch(`/admin/categories/${editingCategoryId}/rename`, {
        name: editingCategoryName.trim(),
      });
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao renomear categoria.',
      );
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      if (category.active) {
        await apiClient.patch(`/admin/categories/${category.id}/deactivate`);
      } else {
        await apiClient.patch(`/admin/categories/${category.id}/activate`);
      }
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao alterar status da categoria.',
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-heading">
            Categorias de produtos
          </h1>
          <p className="text-xs text-muted">
            Estruture o catálogo organizando os produtos em categorias claras
            para a sua loja fitness.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-edge bg-surface p-4 text-xs">
        <form
          onSubmit={handleCreateCategory}
          className="flex flex-wrap items-center gap-2"
        >
          <label className="flex flex-1 min-w-[220px] flex-col gap-1 text-[11px] font-medium text-label">
            Nome da nova categoria
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex.: Tops, Leggings, Conjuntos..."
              className="h-8 w-full rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/35"
            />
          </label>

          <button
            type="submit"
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-brand px-3.5 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover"
          >
            Criar categoria
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-4 py-3 text-left font-semibold">Categoria</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-xs text-muted"
                >
                  Carregando categorias...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-xs text-danger"
                >
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-xs text-muted"
                >
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              categories.map((category) => {
                const isEditing = editingCategoryId === category.id;

                return (
                  <tr
                    key={category.id}
                    className="border-t border-edge hover:bg-surface-alt"
                  >
                    <td className="px-4 py-3 align-middle">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingCategoryName}
                          onChange={(e) =>
                            setEditingCategoryName(e.target.value)
                          }
                          className="h-7 w-full rounded-lg border border-edge-strong bg-surface-input px-2 text-xs text-heading outline-none focus:border-brand focus:ring-1 focus:ring-brand/35"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-heading">
                            {category.name}
                          </span>
                          <span className="text-[11px] text-faint">
                            ID #{category.id}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          category.active
                            ? 'border-green-200 bg-green-50 text-green-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'border-edge bg-surface-alt text-muted'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {category.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex justify-end gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="inline-flex items-center rounded-lg border border-brand bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand hover:bg-brand-muted"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="inline-flex items-center rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-body hover:bg-surface-alt"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(category)}
                              className="inline-flex items-center rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
                            >
                              Renomear
                            </button>
                            <button
                              onClick={() => toggleCategoryStatus(category)}
                              className="inline-flex items-center rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-danger-action hover:text-danger"
                            >
                              {category.active ? 'Desativar' : 'Ativar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

