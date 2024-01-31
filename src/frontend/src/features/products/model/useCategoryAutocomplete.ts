import { categoriesApi } from 'src/features/categories';
import { type SelectOption } from 'src/types';

interface UseCategoryAutocompleteResult {
  data: SelectOption[];
  isLoading: boolean;
}

const QUERY_ARG = {};

export const useCategoryAutocomplete = (): UseCategoryAutocompleteResult => {
  const query = categoriesApi.useGetCategorySelectOptionsQuery(QUERY_ARG, { refetchOnFocus: true });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
};
