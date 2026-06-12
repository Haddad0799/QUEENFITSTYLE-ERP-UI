/**
 * Estoque de um SKU dentro de um produto — GET /erp/stock/products
 */
export type StockSkuDTO = {
  skuId: number;
  skuCode: string;
  colorName: string | null;
  sizeName: string | null;
  quantity: number;
  reserved: number;
  available: number;
  minQuantity: number;
  lowStock: boolean;
};

/**
 * Produto com visão de estoque agregada — GET /erp/stock/products
 */
export type StockProductDTO = {
  productId: number;
  productName: string;
  primaryImageUrl: string | null;
  hasLowStock: boolean;
  skus: StockSkuDTO[];
};

export type PageResponseStockProductDTO = {
  items: StockProductDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * Tipos de movimentação conhecidos. A API pode evoluir, por isso aceitamos
 * `string` como fallback — o painel de movimentações trata o desconhecido
 * com um visual neutro.
 */
export type StockMovementType =
  | 'INBOUND'
  | 'OUTBOUND'
  | 'ADJUSTMENT'
  | 'RESERVATION'
  | 'RELEASE'
  | (string & {});

/**
 * Histórico — GET /erp/skus/{skuId}/stock/movements
 */
export type StockMovementDTO = {
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  minQuantity: number;
  createdAt?: string | null;
};
