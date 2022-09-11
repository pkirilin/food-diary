import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/store';
import { GetProductsRequest } from '../api/contracts';

const selectProductsFilter = (state: RootState) => state.products.filter;

export const selectProductsQueryArg = createSelector(
  selectProductsFilter,
  ({ pageNumber, pageSize, productSearchName, category }): GetProductsRequest => ({
    pageNumber,
    pageSize,
    productSearchName,
    categoryId: category?.id,
  }),
);
