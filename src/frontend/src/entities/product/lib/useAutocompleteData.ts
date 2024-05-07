import { useMemo } from 'react';
import { type ProductSelectOption } from '../api/contracts';
import { productApi } from '../api/productApi';
import { type AutocompleteOption } from '../model/types';

const mapToAutocompleteOption = ({
  id,
  name,
  defaultQuantity,
}: ProductSelectOption): AutocompleteOption => ({
  id,
  name,
  defaultQuantity,
});

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
