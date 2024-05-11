import { createDraftSafeSelector, createSelector } from '@reduxjs/toolkit';
import { type RootState, useAppSelector } from '@/app/store';
import { type Product, productApi } from '@/entities/product';
import { type ProductsState } from '../model';
import { mapToGetProductsRequest } from './mapping';

const selectProducts = (state: RootState): ProductsState => state.products;

const selectProductsFilter = createDraftSafeSelector(selectProducts, products => products.filter);

const selectProductsQueryArg = createSelector(selectProductsFilter, mapToGetProductsRequest);

interface Result {
  data: Product[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isChanged: boolean;
}

export const useProducts = (): Result => {
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);

  return productApi.useGetProductsQuery(getProductsQueryArg, {
    selectFromResult: ({ data, isLoading, isFetching, isSuccess }) => ({
      data: data?.productItems ?? [],
      totalCount: data?.totalProductsCount ?? 0,
      isLoading,
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
};
