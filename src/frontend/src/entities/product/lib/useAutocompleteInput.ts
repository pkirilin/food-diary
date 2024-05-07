import { type UseInputResult, useInput } from '@/shared/hooks';
import { type MapToInputPropsFunction, type ValidatorFunction } from '@/shared/types';
import { type AutocompleteOption } from '../model/types';
import { type ProductAutocompleteProps } from '../ui/ProductAutocomplete';

export type AutocompleteInputProps = Pick<
  ProductAutocompleteProps,
  'value' | 'onChange' | 'error' | 'helperText'
>;

export type AutocompleteInput = UseInputResult<AutocompleteOption | null, AutocompleteInputProps>;

const mapToInputProps: MapToInputPropsFunction<
  AutocompleteOption | null,
  AutocompleteInputProps
> = ({ value, setValue, isInvalid, helperText }) => ({
  value,
  onChange: newValue => {
    setValue(newValue);
  },
  error: isInvalid,
  helperText,
});

const validate: ValidatorFunction<AutocompleteOption | null> = value => value !== null;

export const useAutocompleteInput = (
  initialValue: AutocompleteOption | null = null,
): AutocompleteInput =>
  useInput({
    initialValue,
    errorHelperText: 'Product is required',
    validate,
    mapToInputProps,
  });
