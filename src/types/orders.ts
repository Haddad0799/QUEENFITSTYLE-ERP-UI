export type OrderStatus =
  | 'WAITING_SELLER_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED';

/**
 * Lista — GET /erp/orders
 */
export type OrderSummaryDTO = {
  orderId: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
};

export type PageResponseOrderSummaryDTO = {
  items: OrderSummaryDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * Detalhe — GET /erp/orders/{orderId}
 */
export type OrderCustomerDTO = {
  customerId: number;
  name: string;
  phone: string;
  city: string;
};

export type OrderItemDTO = {
  itemId: number;
  skuId: number;
  skuCode: string;
  productName: string;
  colorName: string | null;
  sizeLabel: string | null;
  reservationId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  /**
   * Imagem opcional do produto. Não vem na resposta atual da API mas é
   * tratada quando presente para suportar evolução futura sem mudança.
   */
  imageUrl?: string | null;
};

export type OrderReservationStatus =
  | 'RESERVED'
  | 'CONFIRMED'
  | 'RELEASED'
  | 'EXPIRED'
  | (string & {});

export type OrderReservationDTO = {
  reservationId: string;
  skuId: number;
  skuCode: string;
  quantity: number;
  status: OrderReservationStatus;
  expiresAt: string | null;
};

/**
 * Tipos de evento conhecidos. A API pode evoluir, por isso aceitamos
 * `string` como fallback — o componente de timeline trata o desconhecido
 * com um visual neutro.
 */
export type OrderTimelineEventType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'ORDER_EXPIRED'
  | (string & {});

export type OrderTimelineEventDTO = {
  eventId: number;
  eventType: OrderTimelineEventType;
  description: string | null;
  payload: string | null;
  actor: string | null;
  createdAt: string;
};

export type OrderDetailsDTO = {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  whatsappMessage: string | null;
  createdAt: string;
  updatedAt: string | null;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  customer: OrderCustomerDTO;
  items: OrderItemDTO[];
  reservations: OrderReservationDTO[];
  timeline: OrderTimelineEventDTO[];
};

/**
 * Resposta lightweight retornada por /confirm, /cancel e /expire.
 */
export type OrderActionResultDTO = {
  orderId: number;
  status: OrderStatus;
  confirmedAt: string | null;
  cancelledAt: string | null;
};

/**
 * Filtros aceitos por GET /erp/orders.
 */
export type OrderListFilters = {
  status?: OrderStatus | '';
  customerName?: string;
  phone?: string;
  skuCode?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
};
