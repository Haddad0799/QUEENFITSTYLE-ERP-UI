export type SizeAdminDetailsDTO = {
  id: number;
  etiqueta: string;
  tipo: string;
  ordem: number;
};

export type SizesAdminDetailsDTO = {
  tamanhosDisponiveis: SizeAdminDetailsDTO[];
};

export type ColorAdminDetailsDTO = {
  id: number;
  nome: string;
  hexaCode: string;
};

export type ColorsAdminDetailsDTO = {
  coresDispoiveis: ColorAdminDetailsDTO[];
};

export type SkuAttributes = {
  colorId: number;
  colorName: string;
  sizeId: number;
  sizeName: string;
};

export type SkuDimensions = {
  width: number;
  height: number;
  length: number;
  weight: number;
};

export type SkuStock = {
  total: number;
  reserved: number;
  available: number;
};

export type SkuPriceDTO = {
  costPrice: number;
  sellingPrice: number;
};

export type SkuImageDTO = {
  id: number;
  url: string;
  order: number;
};

export type SkuDetailsDTO = {
  id: number;
  code: string;
  status: string;
  attributes: SkuAttributes;
  dimensions: SkuDimensions;
  stock: SkuStock;
  price: SkuPriceDTO;
  images: SkuImageDTO[];
};

export type UpdateSkuDimensionsDTO = {
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
};

export type PresignedUrlDTO = {
  uploadUrl: string;
  imageKey: string;
};

export type ProductImageDTO = {
  id: number;
  url: string;
  order: number;
};

export type ProductColorImagesDTO = {
  colorName: string;
  images: ProductImageDTO[];
};

