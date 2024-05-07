import { useAppSelector } from '@/app/store';
import { productApi } from '@/entities/product';
import { selectProductsQueryArg } from '../selectors';
import { type Product } from '../types';

interface Result {
  data: Product[];
  isFetching: boolean;
  isChanged: boolean;
}

export const useProducts = (): Result => {
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);

  return productApi.useGetProductsQuery(getProductsQueryArg, {
    selectFromResult: ({ data, isFetching, isSuccess }) => ({
      data: data?.productItems ?? [],
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
};
