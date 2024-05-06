import { categoryApi, type categoryModel } from '@/entities/category';

interface Result {
  data: categoryModel.Category[];
  isFetching: boolean;
  isChanged: boolean;
}

const QUERY_ARG = {};

export const useCategories = (): Result =>
  categoryApi.useGetCategoriesQuery(QUERY_ARG, {
    selectFromResult: ({ data, isFetching, isSuccess }) => ({
      data: data ?? [],
      isFetching,
      isChanged: !isFetching && isSuccess,
    }),
  });
