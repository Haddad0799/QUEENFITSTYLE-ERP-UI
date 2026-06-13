import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PAGE_SIZE } from '../config';
import { apiClient } from '../lib/api-client';
import { extractCategories } from '../lib/category-utils';
import { DownloadIcon } from '../components/icons';
import { useToast } from '../components/toast/ToastProvider';
import { useUrlFilters } from '../hooks/useUrlFilters';
import type {
  PageResponseProductSummaryDTO,
  ProductStatus,
  ProductSummaryDTO,
} from '../types/products';
import type { Category } from '../types/categories';

/** Estado de filtros sincronizado com a URL. `categoryId: 0` significa "todas". */
type ProductFilterState = {
  status: ProductStatus | '';
  categoryId: number;
  view: ProductView;
  page: number;
};

/**
 * Visualização de status: controla a presença de arquivados na listagem.
 * - active: comportamento padrão (backend já omite arquivados)
 * - archived: apenas arquivados (status=ARCHIVED)
 * - all: ativos + arquivados (includeArchived=true)
 */
type ProductView = 'active' | 'archived' | 'all';

const PRODUCT_VIEW_OPTIONS: { value: ProductView; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'archived', label: 'Arquivados' },
  { value: 'all', label: 'Todos' },
];

/** Status selecionáveis no filtro manual. Arquivados são controlados pela visualização. */
const SELECTABLE_STATUSES: ProductStatus[] = [
  'DRAFT',
  'READY_FOR_SALE',
  'PUBLISHED',
  'INACTIVE',
];

const isLaunchProduct = (product: Pick<ProductSummaryDTO, 'launch' | 'isLaunch'>) =>
  Boolean(product.launch ?? product.isLaunch);

const STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: 'Rascunho',
  READY_FOR_SALE: 'Pronto p/ venda',
  PUBLISHED: 'Publicado',
  INACTIVE: 'Inativo',
  ARCHIVED: 'Arquivado',
};

const STATUS_BADGE: Record<ProductStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  READY_FOR_SALE:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/40',
  PUBLISHED:
    'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  INACTIVE: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/80 dark:text-gray-400 dark:border-gray-700',
  ARCHIVED: 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-900/80 dark:text-gray-500 dark:border-gray-800',
};

export function ProductsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { values, setValues } = useUrlFilters<ProductFilterState>({
    status: '',
    categoryId: 0,
    view: 'active',
    page: 0,
  });
  const { status, categoryId, view, page } = values;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PageResponseProductSummaryDTO | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProductSummaryDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        status: status || undefined,
        categoryId: categoryId || undefined,
        page,
        size: DEFAULT_PAGE_SIZE,
      };
      if (view === 'archived') {
        params.status = 'ARCHIVED';
      } else if (view === 'all') {
        params.includeArchived = true;
      }
      const response = await apiClient.get<PageResponseProductSummaryDTO>(
        '/erp/products',
        params,
      );
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar produtos.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<unknown>('/erp/categories');
      setCategories(extractCategories(response));
    } catch {
      // silencioso por enquanto; a UX principal continua funcionando
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, view, status, categoryId]);

  const handleViewChange = (value: string) => {
    setValues({ view: value as ProductView, page: 0 });
  };

  const handleStatusChange = (value: string) => {
    setValues({ status: value as ProductStatus | '', page: 0 });
  };

  const handleCategoryChange = (value: string) => {
    setValues({ categoryId: value ? Number(value) : 0, page: 0 });
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/erp/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.success('Produto removido');
      loadProducts();
    } catch (err) {
      // O backend devolve uma mensagem amigável (ex.: 409 para produto
      // publicado); exibimos exatamente ela no modal.
      setDeleteError(
        err instanceof Error ? err.message : 'Erro ao remover produto.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const canGoPrev = useMemo(() => page > 0, [page]);
  const canGoNext = useMemo(
    () => totalPages > 0 && page < totalPages - 1,
    [page, totalPages],
  );

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Produtos do catálogo
          </h1>
          <p className="text-xs text-muted">
            Gerencie os produtos que serão exibidos na sua loja de roupas de
            academia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/products/import')}
            className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface-alt px-3.5 py-2.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98]"
          >
            <DownloadIcon className="h-4 w-4" />
            Importar
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.98]"
          >
            <span className="text-base leading-none">＋</span>
            Novo produto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-3 text-xs sm:flex-row sm:flex-wrap sm:items-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Filtros
        </span>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            value={view}
            onChange={(e) => handleViewChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:h-8 sm:w-auto sm:min-w-[140px]"
          >
            {PRODUCT_VIEW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={view === 'archived'}
            className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-auto sm:min-w-[180px]"
          >
            <option value="">Todos os status</option>
            {SELECTABLE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABEL[option]}
              </option>
            ))}
          </select>

          <select
            value={categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 sm:h-8 sm:w-auto sm:min-w-[180px]"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[11px] text-faint sm:ml-auto">
          {totalItems} resultado(s)
        </span>
      </div>

      {/* Product list — cards on mobile, table on md+ */}
      <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">Categoria</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted">
                    Carregando produtos...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-danger">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted">
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                items.map((product: ProductSummaryDTO) => (
                  <tr
                    key={product.id}
                    className="border-t border-edge transition-colors hover:bg-surface-alt"
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        {product.mainImageUrl ? (
                          <img
                            src={product.mainImageUrl}
                            alt={product.name}
                            className="h-10 w-10 flex-shrink-0 rounded-lg border border-edge object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-edge bg-surface-alt text-[10px] text-faint">
                            sem img
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-heading">{product.name}</span>
                            {isLaunchProduct(product) && (
                              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Lançamento
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-faint">ID #{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-body">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE[product.status]}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      {product.status === 'ARCHIVED' ? (
                        <span className="text-[11px] text-faint">
                          Somente leitura
                        </span>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
                          >
                            Detalhes
                          </button>
                          {product.status !== 'PUBLISHED' && (
                            <button
                              onClick={() => { setDeleteError(null); setDeleteTarget(product); }}
                              className="inline-flex items-center rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-danger-action hover:text-danger"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-edge md:hidden">
          {isLoading && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              Carregando produtos...
            </div>
          )}
          {!isLoading && error && (
            <div className="px-4 py-8 text-center text-sm text-danger">
              {error}
            </div>
          )}
          {!isLoading && !error && items.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              Nenhum produto encontrado.
            </div>
          )}
          {!isLoading &&
            !error &&
            items.map((product: ProductSummaryDTO) => {
              const isArchived = product.status === 'ARCHIVED';
              const content = (
                <>
                  {product.mainImageUrl ? (
                    <img
                      src={product.mainImageUrl}
                      alt={product.name}
                      className="h-14 w-14 flex-shrink-0 rounded-xl border border-edge object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-alt text-[10px] text-faint">
                      sem img
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-heading">
                        {product.name}
                      </span>
                      {isLaunchProduct(product) && (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Lançamento
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted">
                      {product.categoryName}
                    </span>
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[product.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      {STATUS_LABEL[product.status]}
                    </span>
                  </div>
                </>
              );

              // Arquivados: somente leitura, sem navegação nem ações.
              if (isArchived) {
                return (
                  <div
                    key={product.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt active:bg-surface-alt"
                >
                  {content}
                  {product.status !== 'PUBLISHED' && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteError(null); setDeleteTarget(product); }}
                      className="flex-shrink-0 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[10px] font-medium text-danger transition hover:border-danger-action active:scale-[0.97]"
                    >
                      Excluir
                    </button>
                  )}
                  {product.status === 'PUBLISHED' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-faint"><polyline points="9 18 15 12 9 6"/></svg>
                  )}
                </button>
              );
            })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-edge bg-surface-alt px-4 py-3 text-[11px] text-muted">
          <span>
            Página{' '}
            <span className="font-semibold text-heading">
              {totalPages === 0 ? 0 : page + 1}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-heading">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={!canGoPrev}
              onClick={() => canGoPrev && setValues({ page: Math.max(0, page - 1) })}
              className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium text-body transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={!canGoNext}
              onClick={() =>
                canGoNext &&
                setValues({
                  page: totalPages ? Math.min(totalPages - 1, page + 1) : page,
                })
              }
              className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium text-body transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-edge bg-surface p-5 text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold text-heading">
              Excluir produto
            </h3>
            <p className="mb-4 text-[11px] leading-relaxed text-label">
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-heading">{deleteTarget.name}</span>?
              Esta ação não pode ser desfeita.
            </p>
            {deleteError && (
              <div className="mb-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
                {deleteError}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="inline-flex h-8 items-center rounded-lg border border-danger-edge bg-danger-action px-3 text-[11px] font-semibold text-white shadow hover:bg-danger-action/90 disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

