import { useAppSelector } from '@/store';
import { productsApi } from '../api';
import { selectProductsQueryArg } from '../selectors';
import { type Product } from '../types';

interface Result {
  data: Product[];
  isFetching: boolean;
  isChanged: boolean;
}

export const useProducts = (): Result => {
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);

  return productsApi.useGetProductsQuery(getProductsQueryArg, {
    selectFromResult: ({ data, isFetching, isSuccess }) => ({
      data: data?.productItems ?? [],
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
};
