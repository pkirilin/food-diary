import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/store';
import { GetProductsRequest } from '../api/contracts';

const selectProducts = (state: RootState) => state.products;

const selectProductsFilter = createDraftSafeSelector(selectProducts, products => products.filter);

export const selectProductsQueryArg = createSelector(
  selectProductsFilter,
  ({ pageNumber, pageSize, productSearchName, category }): GetProductsRequest => ({
    pageNumber,
    pageSize,
    productSearchName,
    categoryId: category?.id,
  }),
);

export const selectCheckedProductIds = createSelector(
  selectProducts,
  state => state.checkedProductIds,
);
