import { apiClient } from '../lib/api-client';
import type { PageResponseStockProductDTO } from '../types/stock';

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

  inbound: (skuId: number, quantity: number) =>
    apiClient.post<void>(`/erp/skus/${skuId}/stock/inbound`, { quantity }),
};
