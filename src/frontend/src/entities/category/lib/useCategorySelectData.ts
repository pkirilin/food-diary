import { useMemo } from 'react';
import { type SelectOption } from '@/shared/types';
import { categoryApi } from '../api';

export interface CategorySelectData {
  data: SelectOption[];
  isLoading: boolean;
}

export const useCategorySelectData = (): CategorySelectData => {
  const { data, isLoading } = categoryApi.useGetCategorySelectOptionsQuery();

  return useMemo(
    () => ({
      data: data ?? [],
      isLoading,
    }),
    [data, isLoading],
  );
};
