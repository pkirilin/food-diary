import { useMemo } from 'react';
import { type ProductSelectOption, productsApi } from '@/features/products';
import { type ValidatorFunction, type MapToInputPropsFunction, type SelectOption } from '@/types';
import { type ProductAutocompleteWithoutDialogProps } from '../ui';
import { type ProductFormType } from './types';

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
  editing: boolean;
  caloriesCost: number;
  category: SelectOption | null;
  inputValue?: string;
}

export type AutocompleteOptionType = AutocompleteExistingOption | AutocompleteFreeSoloOption;

export type AutocompleteInputProps = Omit<
  ProductAutocompleteWithoutDialogProps,
  'options' | 'loading' | 'renderInputDialog' | 'dialogValue'
>;

export const mapToAutocompleteProps: MapToInputPropsFunction<
  AutocompleteOptionType | null,
  AutocompleteInputProps
> = ({ value, setValue, isInvalid, helperText }) => ({
  value,
  onChange: newValue => {
    setValue(newValue);
  },
  error: isInvalid,
  helperText,
});

export const validateAutocompleteInput: ValidatorFunction<AutocompleteOptionType | null> = value =>
  value !== null;

export const mapToProductFormType = ({
  name,
  defaultQuantity,
  caloriesCost,
  category,
}: AutocompleteFreeSoloOption): ProductFormType => ({
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

export interface UseAutocompleteResult {
  options: AutocompleteOptionType[];
  isLoading: boolean;
}

export const useAutocomplete = (): UseAutocompleteResult => {
  const query = productsApi.useGetProductSelectOptionsQuery(QUERY_ARG, { refetchOnFocus: true });

  const options = useMemo(() => query.data?.map(mapToAutocompleteOption) ?? [], [query.data]);

  return {
    options,
    isLoading: query.isLoading,
  };
};