import { AutocompleteOption, ItemsFilterBase } from '../__shared__/models';
import { CategoryAutocompleteOption } from '../categories/models';

export interface ProductItem {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
  categoryName: string;
}

export interface ProductCreateEdit {
  name: string;
  caloriesCost: number;
  categoryId: number;
}

export interface ProductsSearchResult {
  productItems: ProductItem[];
  totalProductsCount: number;
}

export interface ProductItemsFilter extends ItemsFilterBase {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  category: CategoryAutocompleteOption | null;
}

export type ProductAutocompleteOption = AutocompleteOption;
