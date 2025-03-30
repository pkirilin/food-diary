export interface Product {
  id: number;
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface GetProductsResponse {
  productItems: Product[];
  totalProductsCount: number;
}

export interface GetProductsRequest {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  categoryId?: number;
}

export interface GetProductByIdResponse {
  id: number;
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: Category;
}

export interface ProductSelectOption {
  id: number;
  name: string;
  defaultQuantity: number;
}

export interface CreateProductRequest {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  categoryId: number;
}

export interface CreateProductResponse {
  id: number;
}

export interface EditProductRequest {
  id: number;
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  categoryId: number;
}

export interface DeleteProductsRequest {
  ids: number[];
}
