import { ClearProductsFilterAction, ProductsFilterActionTypes, UpdateProductsFilterAction } from '../../action-types';
import { ProductsFilter } from '../../models';

export const updateProductsFilter = (updatedFilter: ProductsFilter): UpdateProductsFilterAction => {
  return {
    type: ProductsFilterActionTypes.UpdateFilter,
    updatedFilter,
  };
};

export const clearProductsFilter = (): ClearProductsFilterAction => {
  return {
    type: ProductsFilterActionTypes.ClearFilter,
  };
};
