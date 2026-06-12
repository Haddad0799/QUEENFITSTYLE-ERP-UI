import { useCallback, useEffect, useRef, useState } from 'react';
import { stockService } from '../../services/stock';
import type { StockOverviewDTO } from '../../types/stock';

export function useStock() {
  const [data, setData] = useState<StockOverviewDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchStock = useCallback(
    async (mode: 'initial' | 'refetch' = 'initial') => {
      const requestId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsRefetching(true);
      setError(null);

      try {
        const response = await stockService.list();
        if (requestId !== requestIdRef.current) return;
        setData(response);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar o estoque.',
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchStock('initial');
  }, [fetchStock]);

  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: () => fetchStock('refetch'),
  };
}
