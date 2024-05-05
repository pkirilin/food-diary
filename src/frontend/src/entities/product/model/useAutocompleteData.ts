import { useMemo } from 'react';
import { type ProductSelectOption, productsApi } from '@/features/products';
import {
  type AutocompleteFreeSoloOption,
  type AutocompleteOptionType,
  type FormValues,
} from './types';

export const mapToProductFormType = ({
  name,
  defaultQuantity,
  caloriesCost,
  category,
}: AutocompleteFreeSoloOption): FormValues => ({
  name,
  defaultQuantity,
  caloriesCost,
  category,
});

const mapToAutocompleteOption = ({
  id,
  name,
  defaultQuantity,
}: ProductSelectOption): AutocompleteOptionType => ({
  id,
  name,
  defaultQuantity,
});

export interface AutocompleteData {
  options: AutocompleteOptionType[];
  isLoading: boolean;
}

export const useAutocompleteData = (): AutocompleteData => {
  const query = productsApi.useGetProductSelectOptionsQuery();

  const options = useMemo(() => query.data?.map(mapToAutocompleteOption) ?? [], [query.data]);

  return {
    options,
    isLoading: query.isLoading,
  };
};
