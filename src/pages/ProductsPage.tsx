import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PAGE_SIZE } from '../config';
import { apiClient } from '../lib/api-client';
import type {
  PageResponseProductSummaryDTO,
  ProductStatus,
  ProductSummaryDTO,
} from '../types/products';
import type { CategoriesDetailsDTO, Category } from '../types/categories';

type Filters = {
  status?: ProductStatus | '';
  categoryId?: number | '';
};

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
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PageResponseProductSummaryDTO | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PageResponseProductSummaryDTO>(
        '/erp/products',
        {
          status: filters.status || undefined,
          categoryId: filters.categoryId || undefined,
          page,
          size: DEFAULT_PAGE_SIZE,
        },
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
      const response = await apiClient.get<CategoriesDetailsDTO>(
        '/erp/categories',
      );
      setCategories(response.categorias ?? []);
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
  }, [page, filters.status, filters.categoryId]);

  const handleStatusChange = (value: string) => {
    setPage(0);
    setFilters((prev) => ({ ...prev, status: value as ProductStatus | '' }));
  };

  const handleCategoryChange = (value: string) => {
    setPage(0);
    setFilters((prev) => ({
      ...prev,
      categoryId: value ? Number(value) : '',
    }));
  };

  const canGoPrev = useMemo(() => page > 0, [page]);
  const canGoNext = useMemo(
    () => totalPages > 0 && page < totalPages - 1,
    [page, totalPages],
  );

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-heading">
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
            className="inline-flex items-center gap-2 rounded-lg border border-edge bg-surface-alt px-3.5 py-2 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface"
          >
            <span className="text-base leading-none">📥</span>
            Importar
          </button>
          <button
            onClick={() => navigate('/products/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover"
          >
            <span className="text-base leading-none">＋</span>
            Novo produto
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-edge bg-surface p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Filtros
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status ?? ''}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-8 min-w-[180px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/35"
          >
            <option value="">Todos os status</option>
            {(
              ['DRAFT', 'READY_FOR_SALE', 'PUBLISHED', 'INACTIVE', 'ARCHIVED'] as ProductStatus[]
            ).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.categoryId ?? ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-8 min-w-[180px] rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/35"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-faint">
            {totalItems} resultado(s)
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-muted"
                  >
                    Carregando produtos...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-danger"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-muted"
                  >
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                items.map((product: ProductSummaryDTO) => (
                  <tr
                    key={product.id}
                    className="border-t border-edge hover:bg-surface-alt"
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
                          <span className="text-sm font-medium text-heading">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-faint">
                            ID #{product.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-body">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE[product.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-edge bg-surface-alt px-4 py-3 text-[11px] text-muted">
          <span>
            Página{' '}
            <span className="font-semibold text-heading">
              {totalPages === 0 ? 0 : page + 1}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-heading">
              {totalPages}
            </span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={!canGoPrev}
              onClick={() => canGoPrev && setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-xs font-medium text-body disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={!canGoNext}
              onClick={() =>
                canGoNext && setPage((p) => (totalPages ? Math.min(totalPages - 1, p + 1) : p))
              }
              className="inline-flex h-7 items-center rounded-lg border border-edge-strong bg-surface px-2 text-xs font-medium text-body disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

