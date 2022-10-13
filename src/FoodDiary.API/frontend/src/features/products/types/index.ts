import { CategorySelectOption } from 'src/features/categories';
import { SelectOption } from 'src/types';

export type Product = {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
  categoryName: string;
};

export type ProductsResponse = {
  productItems: Product[];
  totalProductsCount: number;
};

export type ProductFormData = {
  name: string;
  caloriesCost: number;
  category: CategorySelectOption;
};

export type ProductSelectOption = SelectOption;
