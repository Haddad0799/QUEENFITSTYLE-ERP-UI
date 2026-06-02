import { useCallback, useState } from 'react';
import { ordersService } from '../../services/orders';
import type {
  OrderActionResultDTO,
  OrderDetailsDTO,
  OrderStatus,
} from '../../types/orders';

type Handlers = {
  /**
   * Aplica uma atualização otimista no cache local antes da request retornar.
   */
  onOptimisticUpdate?: (
    updater: (current: OrderDetailsDTO) => OrderDetailsDTO,
  ) => void;
  /**
   * Aplica o resultado lightweight da API (status + timestamps) sobre o
   * cache local sem precisar re-buscar o pedido inteiro.
   */
  onResolved?: (result: OrderActionResultDTO) => void;
  /**
   * Reverte o cache local caso a request falhe.
   */
  onRollback?: (previous: OrderDetailsDTO) => void;
};

const patchOrderWithResult = (
  order: OrderDetailsDTO,
  result: OrderActionResultDTO,
): OrderDetailsDTO => ({
  ...order,
  status: result.status,
  confirmedAt: result.confirmedAt ?? order.confirmedAt,
  cancelledAt: result.cancelledAt ?? order.cancelledAt,
});

export function applyActionResult(
  order: OrderDetailsDTO | null,
  result: OrderActionResultDTO,
): OrderDetailsDTO | null {
  if (!order || order.orderId !== result.orderId) return order;
  return patchOrderWithResult(order, result);
}

export function useOrderActions(handlers: Handlers = {}, actor?: string) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = useCallback(
    async (
      order: OrderDetailsDTO,
      optimisticStatus: OrderStatus,
      execute: () => Promise<OrderActionResultDTO>,
      setBusy: (b: boolean) => void,
    ) => {
      setBusy(true);
      setActionError(null);
      const previous = order;
      handlers.onOptimisticUpdate?.((current) => ({
        ...current,
        status: optimisticStatus,
      }));
      try {
        const result = await execute();
        handlers.onResolved?.(result);
        return { ok: true as const, data: result };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao executar a ação.';
        setActionError(message);
        handlers.onRollback?.(previous);
        return { ok: false as const, error: message };
      } finally {
        setBusy(false);
      }
    },
    [handlers],
  );

  const confirm = useCallback(
    (order: OrderDetailsDTO) =>
      run(order, 'CONFIRMED', () => ordersService.confirm(order.orderId, actor), setIsConfirming),
    [run, actor],
  );

  const cancel = useCallback(
    (order: OrderDetailsDTO, reason?: string) =>
      run(
        order,
        'CANCELLED',
        () => ordersService.cancel(order.orderId, reason, actor),
        setIsCancelling,
      ),
    [run, actor],
  );

  const expire = useCallback(
    (order: OrderDetailsDTO) =>
      run(
        order,
        'EXPIRED',
        () => ordersService.expire(order.orderId, actor),
        setIsExpiring,
      ),
    [run, actor],
  );

  return {
    confirm,
    cancel,
    expire,
    isConfirming,
    isCancelling,
    isExpiring,
    isBusy: isConfirming || isCancelling || isExpiring,
    actionError,
    clearError: () => setActionError(null),
  };
}
