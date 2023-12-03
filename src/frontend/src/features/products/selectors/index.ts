import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'src/store';
import { type GetProductsRequest } from '../api/contracts';
import { type ProductsState } from '../store/slice';

const selectProducts = (state: RootState): ProductsState => state.products;

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
