import { CategoryAutocompleteOption } from 'src/features/categories';
import { ItemsFilterBase } from 'src/types';

export interface ProductItemsFilter extends ItemsFilterBase {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  category: CategoryAutocompleteOption | null;
}
