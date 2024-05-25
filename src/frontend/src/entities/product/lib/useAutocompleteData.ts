import { useMemo } from 'react';
import { productApi } from '../api/productApi';
import { type AutocompleteOption } from '../model/types';
import { mapToAutocompleteOption } from './mapping';

export interface AutocompleteData {
  options: AutocompleteOption[];
  isLoading: boolean;
}

export const useAutocompleteData = (): AutocompleteData => {
  const query = productApi.useGetProductSelectOptionsQuery();

  const options = useMemo(() => query.data?.map(mapToAutocompleteOption) ?? [], [query.data]);

  return {
    options,
    isLoading: query.isLoading,
  };
};
