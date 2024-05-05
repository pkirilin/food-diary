import { categoriesApi } from 'src/features/categories';
import { type SelectOption } from 'src/types';

export interface UseCategorySelectResult {
  data: SelectOption[];
  isLoading: boolean;
}

const QUERY_ARG = {};

export const useCategorySelect = (): UseCategorySelectResult => {
  const query = categoriesApi.useGetCategorySelectOptionsQuery(QUERY_ARG);

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
};
