/**
 * Estoque de um SKU (por tamanho) dentro de uma cor — GET /erp/stock/products
 */
export type StockSkuDTO = {
  skuId: number;
  skuCode: string;
  sizeName: string | null;
  quantity: number;
  reserved: number;
  available: number;
  minQuantity: number;
  lowStock: boolean;
};

/**
 * Agrupamento de SKUs por cor — GET /erp/stock/products
 */
export type StockColorDTO = {
  colorId: number;
  colorName: string;
  colorHex: string | null;
  hasLowStock: boolean;
  totalAvailable: number;
  skus: StockSkuDTO[];
};

/**
 * Produto com visão de estoque agregada — GET /erp/stock/products
 */
export type StockProductDTO = {
  productId: number;
  productName: string;
  primaryImageUrl: string | null;
  hasLowStock: boolean;
  colors: StockColorDTO[];
};

export type PageResponseStockProductDTO = {
  items: StockProductDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
