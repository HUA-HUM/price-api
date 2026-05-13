export interface MadreProductSnapshotItemResponse {
  mla: string;
  sku: string;
  totalPrice: number;
  scrapedPrice: number;
  stockQuantity: number;
  amzStatus: string;
  changed: string;
  maxWeight: number;
  meliSalePrice: number;
  meliStatus: string;
  listingTypeId: string;
  subStatus: string | null;
  appStatus: number;
  createdAt: string;
  updatedAt: string;
}

export interface MadreProductsStatusBulkResponse {
  items: MadreProductSnapshotItemResponse[];
  total: number;
}
