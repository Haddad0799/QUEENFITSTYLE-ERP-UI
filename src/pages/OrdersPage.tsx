import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_PAGE_SIZE } from '../config';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrderTable } from '../components/orders/OrderTable';
import { CancelOrderDialog } from '../components/orders/CancelOrderDialog';
import { ExpireOrderDialog } from '../components/orders/ExpireOrderDialog';
import { DeliverOrderDialog } from '../components/orders/DeliverOrderDialog';
import { ReturnOrderDialog } from '../components/orders/ReturnOrderDialog';
import { useOrders } from '../hooks/orders/useOrders';
import { useToast } from '../components/toast/ToastProvider';
import { ordersService } from '../services/orders';
import type {
  OrderListFilters,
  OrderStatus,
  OrderSummaryDTO,
} from '../types/orders';

const FILTER_KEYS = [
  'status',
  'customerName',
  'phone',
  'skuCode',
  'createdAtFrom',
  'createdAtTo',
] as const satisfies readonly (keyof OrderListFilters)[];

const parseFiltersFromParams = (params: URLSearchParams): OrderListFilters => {
  const filters: OrderListFilters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) {
      if (key === 'status') {
        filters.status = value as OrderStatus;
      } else {
        (filters as Record<string, string>)[key] = value;
      }
    }
  }
  return filters;
};

const serializeFiltersToParams = (
  filters: OrderListFilters,
  page: number,
): URLSearchParams => {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value) params.set(key, String(value));
  }
  if (page > 0) params.set('page', String(page));
  return params;
};

export function OrdersPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );
  const page = Number(searchParams.get('page') ?? '0') || 0;

  const { data, isLoading, isRefetching, error, refetch } = useOrders({
    page,
    size: DEFAULT_PAGE_SIZE,
    filters,
  });

  const [confirmTarget, setConfirmTarget] = useState<OrderSummaryDTO | null>(
    null,
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<OrderSummaryDTO | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [expireTarget, setExpireTarget] = useState<OrderSummaryDTO | null>(
    null,
  );
  const [isExpiring, setIsExpiring] = useState(false);
  const [expireError, setExpireError] = useState<string | null>(null);

  const [deliverTarget, setDeliverTarget] = useState<OrderSummaryDTO | null>(
    null,
  );
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);

  const [returnTarget, setReturnTarget] = useState<OrderSummaryDTO | null>(
    null,
  );
  const [isReturning, setIsReturning] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  const updateUrl = useCallback(
    (nextFilters: OrderListFilters, nextPage: number) => {
      setSearchParams(serializeFiltersToParams(nextFilters, nextPage), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const handleFiltersChange = useCallback(
    (next: OrderListFilters) => {
      updateUrl(next, 0);
    },
    [updateUrl],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      updateUrl(filters, nextPage);
    },
    [filters, updateUrl],
  );

  const totalItems = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const items = data?.items ?? [];

  const canGoPrev = page > 0;
  const canGoNext = totalPages > 0 && page < totalPages - 1;

  const handleConfirmOrder = async () => {
    if (!confirmTarget) return;
    setIsConfirming(true);
    try {
      await ordersService.confirm(confirmTarget.orderId);
      toast.success(
        `Pedido #${confirmTarget.orderId} confirmado`,
        'A venda foi marcada como confirmada.',
      );
      setConfirmTarget(null);
      refetch();
    } catch (err) {
      toast.error(
        'Não foi possível confirmar',
        err instanceof Error ? err.message : 'Tente novamente.',
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await ordersService.cancel(cancelTarget.orderId, reason);
      toast.success(
        `Pedido #${cancelTarget.orderId} cancelado`,
        'As reservas de estoque foram liberadas.',
      );
      setCancelTarget(null);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setCancelError(message);
      toast.error('Erro ao cancelar pedido', message);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExpireOrder = async () => {
    if (!expireTarget) return;
    setIsExpiring(true);
    setExpireError(null);
    try {
      await ordersService.expire(expireTarget.orderId);
      toast.success(
        `Pedido #${expireTarget.orderId} expirado`,
        'As reservas foram liberadas para venda.',
      );
      setExpireTarget(null);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setExpireError(message);
      toast.error('Erro ao expirar pedido', message);
    } finally {
      setIsExpiring(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!deliverTarget) return;
    setIsDelivering(true);
    setDeliverError(null);
    try {
      await ordersService.deliver(deliverTarget.orderId);
      toast.success(
        `Pedido #${deliverTarget.orderId} entregue`,
        'O pedido foi marcado como entregue.',
      );
      setDeliverTarget(null);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setDeliverError(message);
      toast.error('Erro ao marcar entrega', message);
    } finally {
      setIsDelivering(false);
    }
  };

  const handleReturnOrder = async (reason: string) => {
    if (!returnTarget) return;
    setIsReturning(true);
    setReturnError(null);
    try {
      await ordersService.return(returnTarget.orderId, reason);
      toast.success(
        `Pedido #${returnTarget.orderId} devolvido`,
        'O estoque dos itens foi reposto.',
      );
      setReturnTarget(null);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setReturnError(message);
      toast.error('Erro ao registrar devolução', message);
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Pedidos
          </h1>
          <p className="text-xs text-muted">
            Acompanhe, confirme e gerencie os pedidos chegados pelo storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface-alt px-3.5 py-2.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98]"
          >
            <span className="text-base leading-none">↻</span>
            Atualizar
          </button>
        </div>
      </div>

      <OrderFilters
        value={filters}
        totalItems={totalItems}
        isRefetching={isRefetching}
        onChange={handleFiltersChange}
      />

      <OrderTable
        items={items}
        isLoading={isLoading}
        error={error}
        onConfirm={(order) => setConfirmTarget(order)}
        onCancel={(order) => {
          setCancelError(null);
          setCancelTarget(order);
        }}
        onExpire={(order) => {
          setExpireError(null);
          setExpireTarget(order);
        }}
        onDeliver={(order) => {
          setDeliverError(null);
          setDeliverTarget(order);
        }}
        onReturn={(order) => {
          setReturnError(null);
          setReturnTarget(order);
        }}
      />

      <div className="flex items-center justify-between rounded-xl border border-edge bg-surface px-4 py-3 text-[11px] text-muted">
        <span>
          Página{' '}
          <span className="font-semibold text-heading">
            {totalPages === 0 ? 0 : page + 1}
          </span>{' '}
          de <span className="font-semibold text-heading">{totalPages}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            disabled={!canGoPrev}
            onClick={() => canGoPrev && handlePageChange(Math.max(0, page - 1))}
            className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium text-body transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={!canGoNext}
            onClick={() =>
              canGoNext &&
              handlePageChange(
                totalPages ? Math.min(totalPages - 1, page + 1) : page,
              )
            }
            className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-xs font-medium text-body transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => !isConfirming && setConfirmTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-edge bg-surface p-5 text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                ✓
              </span>
              <h3 className="text-sm font-semibold text-heading">
                Confirmar venda #{confirmTarget.orderId}
              </h3>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-label">
              Marcar pedido de{' '}
              <span className="font-semibold text-heading">
                {confirmTarget.customerName}
              </span>{' '}
              como confirmado. O estoque das reservas será baixado oficialmente.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setConfirmTarget(null)}
                className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmOrder}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-50"
              >
                {isConfirming && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isConfirming ? 'Confirmando…' : 'Confirmar venda'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CancelOrderDialog
        open={cancelTarget !== null}
        order={cancelTarget}
        isSubmitting={isCancelling}
        error={cancelError}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelOrder}
      />

      <ExpireOrderDialog
        open={expireTarget !== null}
        order={expireTarget}
        isSubmitting={isExpiring}
        error={expireError}
        onClose={() => setExpireTarget(null)}
        onConfirm={handleExpireOrder}
      />

      <DeliverOrderDialog
        open={deliverTarget !== null}
        order={deliverTarget}
        isSubmitting={isDelivering}
        error={deliverError}
        onClose={() => setDeliverTarget(null)}
        onConfirm={handleDeliverOrder}
      />

      <ReturnOrderDialog
        open={returnTarget !== null}
        order={returnTarget}
        isSubmitting={isReturning}
        error={returnError}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturnOrder}
      />
    </div>
  );
}
