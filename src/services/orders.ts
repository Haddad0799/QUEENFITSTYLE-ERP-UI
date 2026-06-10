import { apiClient } from '../lib/api-client';
import type {
  OrderActionResultDTO,
  OrderDetailsDTO,
  OrderListFilters,
  OrderTimelineEventDTO,
  PageResponseOrderSummaryDTO,
} from '../types/orders';

export type ListOrdersParams = OrderListFilters & {
  page: number;
  size: number;
};

const trim = (value: string | undefined) => {
  const next = value?.trim();
  return next ? next : undefined;
};

const actorHeader = (actor?: string) =>
  actor ? { 'X-Actor': actor } : undefined;

export const ordersService = {
  list: (params: ListOrdersParams) =>
    apiClient.get<PageResponseOrderSummaryDTO>('/erp/orders', {
      status: params.status || undefined,
      customerName: trim(params.customerName),
      createdAtFrom: trim(params.createdAtFrom),
      createdAtTo: trim(params.createdAtTo),
      page: params.page,
      size: params.size,
    }),

  get: (orderId: number) =>
    apiClient.get<OrderDetailsDTO>(`/erp/orders/${orderId}`),

  timeline: (orderId: number) =>
    apiClient.get<OrderTimelineEventDTO[]>(`/erp/orders/${orderId}/timeline`),

  confirm: (orderId: number, actor?: string) =>
    apiClient.post<OrderActionResultDTO>(
      `/erp/orders/${orderId}/confirm`,
      undefined,
      {},
      actorHeader(actor),
    ),

  cancel: (orderId: number, reason?: string, actor?: string) =>
    apiClient.post<OrderActionResultDTO>(
      `/erp/orders/${orderId}/cancel`,
      { reason: trim(reason) },
      {},
      actorHeader(actor),
    ),

  expire: (orderId: number, actor?: string) =>
    apiClient.post<OrderActionResultDTO>(
      `/erp/orders/${orderId}/expire`,
      undefined,
      {},
      actorHeader(actor),
    ),

  deliver: (orderId: number, actor?: string) =>
    apiClient.post<OrderActionResultDTO>(
      `/erp/orders/${orderId}/deliver`,
      undefined,
      {},
      actorHeader(actor),
    ),

  return: (orderId: number, reason?: string, actor?: string) =>
    apiClient.post<OrderActionResultDTO>(
      `/erp/orders/${orderId}/return`,
      { reason: trim(reason) },
      {},
      actorHeader(actor),
    ),
};
