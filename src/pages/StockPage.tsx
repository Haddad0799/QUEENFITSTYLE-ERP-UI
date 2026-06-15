import { useEffect, useState } from 'react';
import { useOpenDetail } from '../hooks/useListReturn';
import { DEFAULT_PAGE_SIZE } from '../config';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useStockProducts } from '../hooks/stock/useStock';
import { StockStatusBadge } from '../components/stock/StockStatusBadge';
import { RefreshCwIcon } from '../components/icons';
import type { StockProductDTO } from '../types/stock';

export function StockPage() {
  const openDetail = useOpenDetail();

  const { values, setValues } = useUrlFilters<{ search: string; page: number }>({
    search: '',
    page: 0,
  });
  const { search, page } = values;

  // Texto local do campo de busca; comitado na URL com debounce.
  const [searchInput, setSearchInput] = useState(search);
  // Mantém o campo sincronizado quando a URL muda por fora (voltar do
  // navegador / refresh). Padrão de "derived state" para não usar efeito.
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  // Debounce da busca livre para não disparar uma request por caractere.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchInput !== search) {
        setValues({ search: searchInput, page: 0 });
      }
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isLoading, isRefetching, error, refetch } = useStockProducts({
    page,
    size: DEFAULT_PAGE_SIZE,
    search,
  });

  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const items = data?.items ?? [];

  const canGoPrev = page > 0;
  const canGoNext = totalPages > 0 && page < totalPages - 1;

  const openProduct = (product: StockProductDTO) =>
    openDetail(`/stock/${product.productId}`, {
      state: { productName: product.productName },
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Estoque
          </h1>
          <p className="text-xs text-muted">
            Acompanhe a disponibilidade de estoque por produto e registre
            abastecimentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface-alt px-3.5 py-2.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98]"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-3 text-xs sm:flex-row sm:flex-wrap sm:items-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Busca
        </span>

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Nome do produto"
          className="h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 sm:h-8 sm:w-auto sm:min-w-[240px]"
        />

        <div className="flex items-center gap-2 sm:ml-auto">
          {isRefetching && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              atualizando…
            </span>
          )}
          <span className="text-[11px] text-faint">
            {totalItems} resultado(s)
          </span>
        </div>
      </div>

      {/* Product list — cards on mobile, table on md+ */}
      <div className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-edge bg-surface-alt text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3 text-left font-semibold">Produto</th>
                <th className="px-4 py-3 text-left font-semibold">Cores</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted">
                    Carregando estoque...
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
                    Nenhum produto encontrado com a busca atual.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                items.map((product) => (
                  <tr
                    key={product.productId}
                    className="cursor-pointer border-t border-edge transition-colors hover:bg-surface-alt"
                    onClick={() => openProduct(product)}
                  >
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt={product.productName}
                            className="h-10 w-10 flex-shrink-0 rounded-lg border border-edge object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-edge bg-surface-alt text-[10px] text-faint">
                            sem img
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-heading">
                            {product.productName}
                          </span>
                          <span className="text-[11px] text-faint">
                            ID #{product.productId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-body">
                      {product.colors.length} cor(es)
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StockStatusBadge lowStock={product.hasLowStock} />
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProduct(product);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-edge-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-heading transition hover:border-brand hover:text-brand"
                        >
                          Ver cores
                        </button>
                      </div>
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
              Carregando estoque...
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
            items.map((product) => (
              <button
                key={product.productId}
                type="button"
                onClick={() => openProduct(product)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt active:bg-surface-alt"
              >
                {product.primaryImageUrl ? (
                  <img
                    src={product.primaryImageUrl}
                    alt={product.productName}
                    className="h-14 w-14 flex-shrink-0 rounded-xl border border-edge object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-alt text-[10px] text-faint">
                    sem img
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium text-heading">
                    {product.productName}
                  </span>
                  <span className="text-[11px] text-muted">
                    {product.colors.length} cor(es)
                  </span>
                  <span className="w-fit">
                    <StockStatusBadge lowStock={product.hasLowStock} />
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-faint"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
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
    </div>
  );
}
