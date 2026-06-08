export type OrderStatus =
  /** criado — aguardando confirmação manual do pagamento (reserva RESERVED) */
  | 'PENDING_PAYMENT'
  /** pagamento confirmado — reserva consumida (estoque baixado) */
  | 'PAID'
  /** pedido entregue manualmente */
  | 'DELIVERED'
  /** cancelado por falta de pagamento — reserva liberada */
  | 'CANCELLED'
  /** expirado após 24h sem pagamento — reserva liberada */
  | 'EXPIRED'
  /** devolvido após pago/entregue — estoque reposto */
  | 'RETURNED';

/**
 * Endereço de entrega do pedido. Todos os campos podem vir ausentes
 * dependendo do cadastro do cliente, por isso são opcionais/anuláveis.
 */
export type OrderDeliveryAddressDTO = {
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
};

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
  deliveryAddress: OrderDeliveryAddressDTO | null;
  createdAt: string;
  /** Momento da confirmação do pagamento (transição PENDING_PAYMENT → PAID). */
  confirmedAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
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
  colorHex: string | null;
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
  | 'RETURNED'
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
  | 'WHATSAPP_OPENED'
  | 'PAID'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'RETURNED'
  | 'RESERVATIONS_CONFIRMED'
  | 'RESERVATIONS_RELEASED'
  | 'RESERVATIONS_RETURNED'
  | 'NOTE_ADDED'
  | (string & {});

export type OrderTimelineEventDTO = {
  eventId: number;
  eventType: OrderTimelineEventType;
  description: string | null;
  payload: string | null;
  actor: string | null;
  createdAt: string;
};

export type OrderReservationSummaryDTO = {
  totalReservedItems: number;
  expiresInMinutes: number | null;
  hasExpiredReservations: boolean;
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
  deliveredAt: string | null;
  returnedAt: string | null;
  customer: OrderCustomerDTO;
  deliveryAddress: OrderDeliveryAddressDTO | null;
  items: OrderItemDTO[];
  reservations: OrderReservationDTO[];
  reservationSummary: OrderReservationSummaryDTO | null;
  timeline: OrderTimelineEventDTO[];
};

/**
 * Resposta lightweight retornada por /confirm, /cancel, /expire,
 * /deliver e /return.
 */
export type OrderActionResultDTO = {
  orderId: number;
  status: OrderStatus;
  confirmedAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
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
