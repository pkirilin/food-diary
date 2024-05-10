export interface Product {
  id: number;
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  categoryId: number;
  categoryName: string;
}

export interface ProductsResponse {
  productItems: Product[];
  totalProductsCount: number;
}
