import { apiClient } from '../lib/api-client';
import type {
  PageResponseStockProductDTO,
  StockMovementDTO,
} from '../types/stock';

export type ListStockProductsParams = {
  page: number;
  size: number;
  search?: string;
};

export const stockService = {
  listProducts: (params: ListStockProductsParams) =>
    apiClient.get<PageResponseStockProductDTO>('/erp/stock/products', {
      page: params.page,
      size: params.size,
      search: params.search?.trim() || undefined,
    }),

  movements: (skuId: number) =>
    apiClient.get<StockMovementDTO[]>(`/erp/skus/${skuId}/stock/movements`),

  inbound: (skuId: number, quantity: number) =>
    apiClient.post<void>(`/erp/skus/${skuId}/stock/inbound`, { quantity }),
};
