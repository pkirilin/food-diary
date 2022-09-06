export type GetProductsRequest = {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  categoryId?: number;
};
