import { useMemo } from 'react';
import { type ProductSelectOption, productsApi } from '@/features/products';
import { type SelectOption } from '@/types';

const QUERY_ARG = {};

interface AutocompleteBaseOption {
  freeSolo?: boolean;
  name: string;
  defaultQuantity: number;
}

export interface AutocompleteExistingOption extends AutocompleteBaseOption {
  freeSolo?: false;
  id: number;
}

export interface AutocompleteFreeSoloOption extends AutocompleteBaseOption {
  freeSolo: true;
  caloriesCost: number;
  category: SelectOption | null;
  inputValue?: string;
}

export type AutocompleteOptionType = AutocompleteExistingOption | AutocompleteFreeSoloOption;

const mapToAutocompleteOption = ({
  id,
  name,
  defaultQuantity,
}: ProductSelectOption): AutocompleteOptionType => ({
  id,
  name,
  defaultQuantity,
});

interface Result {
  options: AutocompleteOptionType[];
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
