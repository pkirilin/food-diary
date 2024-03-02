import { categoriesApi } from '../api';
import { type Category } from '../types';

interface Result {
  data: Category[];
  isFetching: boolean;
  isChanged: boolean;
}

const QUERY_ARG = {};

export const useCategories = (): Result =>
  categoriesApi.useGetCategoriesQuery(QUERY_ARG, {
    selectFromResult: ({ data, isFetching, isSuccess }) => ({
      data: data ?? [],
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
