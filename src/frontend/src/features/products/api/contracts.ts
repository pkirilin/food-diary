export interface GetProductsRequest {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  categoryId?: number;
}

export interface CreateProductRequest {
  name: string;
  caloriesCost: number;
  categoryId: number;
}

export interface EditProductRequest {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
}

export interface DeleteProductsRequest {
  ids: number[];
}
