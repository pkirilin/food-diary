import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'src/store';
import { toGetProductsRequest } from '../mapping';
import { type ProductsState } from '../store/slice';

const selectProducts = (state: RootState): ProductsState => state.products;

const selectProductsFilter = createDraftSafeSelector(selectProducts, products => products.filter);

export const selectProductsQueryArg = createSelector(selectProductsFilter, toGetProductsRequest);

export const selectCheckedProductIds = createSelector(
  selectProducts,
  state => state.checkedProductIds,
);
