import { type UseInputResult, useInput } from '@/hooks';
import { type MapToInputPropsFunction, type ValidatorFunction } from '@/types';
import { type ProductAutocompleteProps } from '../ui';
import { type AutocompleteOptionType } from './types';

export type AutocompleteInputProps = Pick<
  ProductAutocompleteProps,
  'value' | 'onChange' | 'error' | 'helperText'
>;

export type AutocompleteInput = UseInputResult<
  AutocompleteOptionType | null,
  AutocompleteInputProps
>;

const mapToInputProps: MapToInputPropsFunction<
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

const validate: ValidatorFunction<AutocompleteOptionType | null> = value => value !== null;

export const useAutocompleteInput = (
  initialValue: AutocompleteOptionType | null = null,
): AutocompleteInput =>
  useInput({
    initialValue,
    errorHelperText: 'Product is required',
    validate,
    mapToInputProps,
  });
