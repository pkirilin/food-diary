import { ItemsFilterBase } from '../__shared__/models';

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
  categoryId: number | null;
}

export type ProductsFilterUpdatedData = Pick<
  ProductItemsFilter,
  'productSearchName' | 'categoryId'
>;
