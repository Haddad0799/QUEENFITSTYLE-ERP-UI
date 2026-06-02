import { useCallback, useEffect, useRef, useState } from 'react';
import { ordersService } from '../../services/orders';
import type { OrderTimelineEventDTO } from '../../types/orders';

export function useOrderTimeline(orderId: number | null) {
  const [events, setEvents] = useState<OrderTimelineEventDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchTimeline = useCallback(async () => {
    if (orderId === null) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ordersService.timeline(orderId);
      if (requestId !== requestIdRef.current) return;
      setEvents(response);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar a timeline.',
      );
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchTimeline,
  };
}
