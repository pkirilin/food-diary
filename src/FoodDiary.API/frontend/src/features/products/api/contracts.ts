export type GetProductsRequest = {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  categoryId?: number;
};

export type CreateProductRequest = {
  name: string;
  caloriesCost: number;
  categoryId: number;
};
