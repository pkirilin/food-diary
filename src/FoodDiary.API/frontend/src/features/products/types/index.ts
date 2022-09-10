import { CategoryAutocompleteOption } from 'src/features/categories';

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
  category: CategoryAutocompleteOption;
};
