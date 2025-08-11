import { type SelectOption } from '@/shared/types';
import { categoryApi } from '../api';

export interface CategorySelectData {
  categories: SelectOption[];
  categoriesLoading: boolean;
}

const EMPTY_CATEGORIES: SelectOption[] = [];
const QUERY_ARG = {};

export const useCategoriesForSelect = (): CategorySelectData =>
  categoryApi.useGetCategorySelectOptionsQuery(QUERY_ARG, {
    selectFromResult: ({ data, isLoading }) =>
      ({
        categories: data ?? EMPTY_CATEGORIES,
        categoriesLoading: isLoading,
      }) satisfies CategorySelectData,
  });
