import { useCallback, useEffect, useRef, useState } from 'react';
import { ordersService, type ListOrdersParams } from '../../services/orders';
import type {
  OrderListFilters,
  OrderStatus,
  PageResponseOrderSummaryDTO,
} from '../../types/orders';
import { useInterval } from '../useInterval';

type UseOrdersOptions = {
  page: number;
  size: number;
  filters: OrderListFilters;
  /**
   * Quando há pedidos em status pendente queremos repolling automático para
   * que a operadora veja atualizações em tempo quase real. Passe null para
   * desativar.
   */
  pollingMs?: number | null;
};

const POLLABLE_STATUSES: OrderStatus[] = ['WAITING_SELLER_CONFIRMATION'];

const hasPollableItems = (data: PageResponseOrderSummaryDTO | null) => {
  if (!data) return false;
  return data.items.some((o) => POLLABLE_STATUSES.includes(o.status));
};

export function useOrders({
  page,
  size,
  filters,
  pollingMs = 30_000,
}: UseOrdersOptions) {
  const [data, setData] = useState<PageResponseOrderSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(
    async (mode: 'initial' | 'refetch' = 'initial') => {
      const requestId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsRefetching(true);
      setError(null);

      try {
        const params: ListOrdersParams = { page, size, ...filters };
        const response = await ordersService.list(params);
        if (requestId !== requestIdRef.current) return;
        setData(response);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar pedidos.',
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [page, size, filters],
  );

  useEffect(() => {
    fetchOrders('initial');
  }, [fetchOrders]);

  const shouldPoll = pollingMs !== null && hasPollableItems(data);
  useInterval(
    () => {
      if (document.visibilityState === 'visible') {
        fetchOrders('refetch');
      }
    },
    shouldPoll ? pollingMs : null,
  );

  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: () => fetchOrders('refetch'),
  };
}
