export type ImportError = {
  rowNumber: number;
  productName: string;
  category: string;
  skuCode: string;
  field: string | null;
  message: string;
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
};
