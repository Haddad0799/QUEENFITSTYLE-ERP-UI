import { useCallback, useEffect, useRef, useState } from 'react';
import { ordersService } from '../../services/orders';
import type { OrderDetailsDTO } from '../../types/orders';

export function useOrder(id: number | null) {
  const [data, setData] = useState<OrderDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchOrder = useCallback(async () => {
    if (id === null) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ordersService.get(id);
      if (requestId !== requestIdRef.current) return;
      setData(response);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar o pedido.',
      );
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /**
   * Permite que mutations (confirm/cancel) atualizem o cache local de forma
   * otimista sem disparar uma nova request.
   */
  const setOrder = useCallback((next: OrderDetailsDTO | null) => {
    setData(next);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOrder,
    setOrder,
  };
}
