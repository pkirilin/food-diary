import { type ItemsFilterBase, type SelectOption } from 'src/types';

export interface ProductItemsFilter extends ItemsFilterBase {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  category: SelectOption | null;
}
