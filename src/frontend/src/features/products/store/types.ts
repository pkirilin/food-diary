import { type ItemsFilterBase, type SelectOption } from '@/shared/types';

export interface ProductItemsFilter extends ItemsFilterBase {
  pageNumber: number;
  pageSize: number;
  productSearchName?: string;
  category: SelectOption | null;
}
