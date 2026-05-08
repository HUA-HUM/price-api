export interface MadreCategoryBySkuMatchDto {
  mlaId: string;
  categoryId: string;
}

export interface MadreCategoryBySkuItemDto {
  sku: string;
  matches: MadreCategoryBySkuMatchDto[];
}

export interface MadreCategoryBySkuBulkResponse {
  items: MadreCategoryBySkuItemDto[];
  total: number;
  limit: number;
  offset: number;
  count: number;
  hasNext: boolean;
  nextOffset: number | null;
}
