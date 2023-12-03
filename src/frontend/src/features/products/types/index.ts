import { type SelectOption } from 'src/types';

export interface Product {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
  categoryName: string;
}

export interface ProductsResponse {
  productItems: Product[];
  totalProductsCount: number;
}

export interface ProductFormData {
  name: string;
  caloriesCost: number;
  category: SelectOption;
}
