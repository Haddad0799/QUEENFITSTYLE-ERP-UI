import { apiClient } from '../lib/api-client';
import type { StockMovementDTO, StockOverviewDTO } from '../types/stock';

export const stockService = {
  list: () => apiClient.get<StockOverviewDTO[]>('/erp/stock'),

  movements: (skuId: number) =>
    apiClient.get<StockMovementDTO[]>(`/erp/skus/${skuId}/stock/movements`),

  inbound: (skuId: number, quantity: number) =>
    apiClient.post<void>(`/erp/skus/${skuId}/stock/inbound`, { quantity }),
};
