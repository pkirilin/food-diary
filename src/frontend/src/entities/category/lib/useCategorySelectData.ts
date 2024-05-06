import { type SelectOption } from 'src/types';
import { categoryApi } from '../api';

export interface CategorySelectData {
  data: SelectOption[];
  isLoading: boolean;
}

export const useCategorySelectData = (): CategorySelectData => {
  const query = categoryApi.useGetCategorySelectOptionsQuery();

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
};
