import { useMemo } from 'react';
import { type ProductSelectOption, productsApi } from '@/features/products';

const QUERY_ARG = {};

export interface ProductOptionType {
  name: string;
  inputValue?: string;
  id?: number;
}

const mapToAutocompleteOption = ({ id, name }: ProductSelectOption): ProductOptionType => ({
  id,
  name,
});

interface Result {
  options: ProductOptionType[];
  isLoading: boolean;
}

export const useAutocomplete = (): Result => {
  const query = productsApi.useGetProductSelectOptionsQuery(QUERY_ARG, { refetchOnFocus: true });

  const options = useMemo(() => query.data?.map(mapToAutocompleteOption) ?? [], [query.data]);

  return {
    options,
    isLoading: query.isLoading,
  };
};
