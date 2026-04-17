export type ImportError = {
  rowNumber: number;
  productName: string;
  category: string;
  skuCode: string;
  field: string | null;
  message: string;
};

export type ImportProductStatus = 'CREATED' | 'REUSED' | 'FAILED';

export type ImportProductError = {
  rowNumber?: number;
  productName?: string;
  category?: string;
  skuCode?: string;
  field?: string | null;
  message: string;
};

export type ImportProductResult = {
  productName: string;
  slug: string;
  category: string;
  totalRows: number;
  productStatus: ImportProductStatus;
  skusCreated: number;
  skusIgnored: number;
  skusFailed: number;
  errors: Array<ImportProductError | string>;
};

export type ImportResult = {
  totalRows: number;
  validRows: number;
  productsCreated: number;
  productsReused: number;
  skusCreated: number;
  skusIgnored: number;
  skusFailed: number;
  errors: ImportError[];
  products?: ImportProductResult[];
};
