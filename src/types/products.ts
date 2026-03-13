export type ProductStatus =
  | 'DRAFT'
  | 'READY_FOR_SALE'
  | 'PUBLISHED'
  | 'INACTIVE'
  | 'ARCHIVED';

export type ProductSummaryDTO = {
  id: number;
  name: string;
  slug: string;
  mainImageUrl: string | null;
  categoryName: string;
  status: ProductStatus;
};

export type PageResponseProductSummaryDTO = {
  items: ProductSummaryDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type SkuStatus =
  | 'INCOMPLETE'
  | 'READY'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'DISCONTINUED';

export type SkuSummaryDTO = {
  id: number;
  code: string;
  colorName: string;
  sizeName: string;
  status: SkuStatus;
};

export type ProductDetailsDTO = {
  id: number;
  name: string;
  description: string;
  slug: string;
  mainImageUrl: string | null;
  categoryId: number;
  categoryName: string;
  status: ProductStatus;
  skus: SkuSummaryDTO[];
};


