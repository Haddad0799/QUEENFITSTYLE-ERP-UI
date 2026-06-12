import { useCallback, useMemo, useState } from 'react';
import { useStock } from '../hooks/stock/useStock';
import { stockService } from '../services/stock';
import { useToast } from '../components/toast/ToastProvider';
import {
  StockTable,
  type StockMovementsState,
} from '../components/stock/StockTable';
import { InboundStockDialog } from '../components/stock/InboundStockDialog';
import { RefreshCwIcon, TagIcon } from '../components/icons';
import type { StockOverviewDTO } from '../types/stock';

/** Remove acentos e baixa a caixa para comparação tolerante na busca livre. */
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[0300-036f]/g, '')
    .toLowerCase();

const matchesQuery = (sku: StockOverviewDTO, query: string) => {
  const fields = [sku.productName, sku.colorName, sku.sizeName, sku.skuCode];
  return fields.some((field) => field && normalize(field).includes(query));
};

const EMPTY_MOVEMENTS: StockMovementsState = {
  data: null,
  isLoading: false,
  error: null,
};

export function StockPage() {
  const toast = useToast();
  const { data, isLoading, isRefetching, error, refetch } = useStock();

  const [query, setQuery] = useState('');

  const [expandedSkuId, setExpandedSkuId] = useState<number | null>(null);
  const [movements, setMovements] =
    useState<StockMovementsState>(EMPTY_MOVEMENTS);

  const [inboundTarget, setInboundTarget] = useState<StockOverviewDTO | null>(
    null,
  );
  const [isSubmittingInbound, setIsSubmittingInbound] = useState(false);
  const [inboundError, setInboundError] = useState<string | null>(null);

  const items = useMemo(() => {
    const all = data ?? [];
    const normalized = normalize(query.trim());
    if (!normalized) return all;
    return all.filter((sku) => matchesQuery(sku, normalized));
  }, [data, query]);

  const loadMovements = useCallback(async (skuId: number) => {
    setMovements({ data: null, isLoading: true, error: null });
    try {
      const response = await stockService.movements(skuId);
      setMovements({ data: response, isLoading: false, error: null });
    } catch (err) {
      setMovements({
        data: null,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erro ao carregar movimentações.',
      });
    }
  }, []);

  const handleToggleRow = useCallback(
    (sku: StockOverviewDTO) => {
      if (expandedSkuId === sku.skuId) {
        setExpandedSkuId(null);
        setMovements(EMPTY_MOVEMENTS);
        return;
      }
      setExpandedSkuId(sku.skuId);
      loadMovements(sku.skuId);
    },
    [expandedSkuId, loadMovements],
  );

  const handleOpenInbound = useCallback((sku: StockOverviewDTO) => {
    setInboundError(null);
    setInboundTarget(sku);
  }, []);

  const handleConfirmInbound = async (quantity: number) => {
    if (!inboundTarget) return;
    setIsSubmittingInbound(true);
    setInboundError(null);
    try {
      await stockService.inbound(inboundTarget.skuId, quantity);
      toast.success(
        'Estoque abastecido',
        `Entrada de ${quantity} unidade(s) registrada para o SKU ${inboundTarget.skuCode}.`,
      );
      const skuId = inboundTarget.skuId;
      setInboundTarget(null);
      refetch();
      if (expandedSkuId === skuId) {
        loadMovements(skuId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setInboundError(message);
      toast.error('Erro ao abastecer estoque', message);
    } finally {
      setIsSubmittingInbound(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Estoque
          </h1>
          <p className="text-xs text-muted">
            Acompanhe a disponibilidade por SKU, registre abastecimentos e
            consulte o histórico de movimentações.
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

      <div className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Filtro
          </span>
          <div className="relative flex-1 sm:max-w-xs">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produto, cor, tamanho ou SKU"
              className="h-8 w-full rounded-lg border border-edge-strong bg-surface-input pl-7 pr-2 text-[11px] text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-faint">
              <TagIcon className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isRefetching && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                atualizando…
              </span>
            )}
            <span className="text-[11px] text-faint">
              {items.length} SKU(s)
            </span>
          </div>
        </div>
      </div>

      <StockTable
        items={items}
        isLoading={isLoading}
        error={error}
        expandedSkuId={expandedSkuId}
        movements={movements}
        onToggleRow={handleToggleRow}
        onInbound={handleOpenInbound}
      />

      {inboundTarget && (
        <InboundStockDialog
          sku={inboundTarget}
          isSubmitting={isSubmittingInbound}
          error={inboundError}
          onClose={() => setInboundTarget(null)}
          onConfirm={handleConfirmInbound}
        />
      )}
    </div>
  );
}
