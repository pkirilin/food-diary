import { useMemo } from 'react';
import { type SelectOption } from '@/shared/types';
import { categoryApi } from '../api';

export interface CategorySelectData {
  data: SelectOption[];
  isLoading: boolean;
}

const EMPTY_DATA: SelectOption[] = [];

export const useCategorySelectData = (): CategorySelectData => {
  const { data, isLoading } = categoryApi.useGetCategorySelectOptionsQuery();

  return useMemo(
    () => ({
      data: data ?? EMPTY_DATA,
      isLoading,
    }),
    [data, isLoading],
  );
};
