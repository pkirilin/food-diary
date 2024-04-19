import { useMemo } from 'react';
import { type ProductSelectOption, productsApi } from '@/features/products';

const QUERY_ARG = {};

export interface ProductOptionType {
  inputValue?: string;
  name: string;
}

const mapToAutocompleteOption = ({ name }: ProductSelectOption): ProductOptionType => ({ name });

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
