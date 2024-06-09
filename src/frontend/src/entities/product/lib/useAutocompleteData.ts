import { useMemo } from 'react';
import { productApi } from '../api/productApi';
import { type AutocompleteOption } from '../model/types';
import { mapToAutocompleteOption } from './mapping';

export interface AutocompleteData {
  options: AutocompleteOption[];
  isLoading: boolean;
}

export const useAutocompleteData = (): AutocompleteData => {
  const { data, isLoading } = productApi.useGetProductSelectOptionsQuery();

  return useMemo(
    () => ({
      options: data?.map(mapToAutocompleteOption) ?? [],
      isLoading,
    }),
    [data, isLoading],
  );
};
