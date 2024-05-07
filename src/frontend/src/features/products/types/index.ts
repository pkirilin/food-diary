import { type SelectOption } from '@/shared/types';

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

export interface ProductFormData {
  name: string;
  caloriesCost: number;
  defaultQuantity: number;
  category: SelectOption;
}
