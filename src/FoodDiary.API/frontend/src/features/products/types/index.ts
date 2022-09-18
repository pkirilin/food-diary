import { CategoryAutocompleteOption } from 'src/features/categories';
import { AutocompleteOption } from 'src/types';

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

export type ProductAutocompleteOption = AutocompleteOption;
