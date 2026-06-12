import { useCallback, useEffect, useRef, useState } from 'react';
import {
  stockService,
  type ListStockProductsParams,
} from '../../services/stock';
import type { PageResponseStockProductDTO } from '../../types/stock';

export function useStockProducts({ page, size, search }: ListStockProductsParams) {
  const [data, setData] = useState<PageResponseStockProductDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(
    async (mode: 'initial' | 'refetch' = 'initial') => {
      const requestId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsRefetching(true);
      setError(null);

      try {
        const response = await stockService.listProducts({ page, size, search });
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
    [page, size, search],
  );

  useEffect(() => {
    fetchProducts('initial');
  }, [fetchProducts]);

  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: () => fetchProducts('refetch'),
  };
}
