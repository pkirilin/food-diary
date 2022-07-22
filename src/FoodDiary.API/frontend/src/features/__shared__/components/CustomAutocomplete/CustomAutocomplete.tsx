import { Autocomplete } from '@mui/material';
import { AutocompleteBindingProps } from '../../hooks/types';
import CustomAutocompleteInput from './CustomAutocompleteInput';

interface CustomAutocompleteProps<TOption> extends AutocompleteBindingProps<TOption> {
  label?: string;
  placeholder?: string;
}

export default function CustomAutocomplete<TOption>({
  label,
  placeholder,
  ...props
}: CustomAutocompleteProps<TOption>) {
  return (
    <Autocomplete
      {...props}
      renderInput={params => (
        <CustomAutocompleteInput
          renderInputParams={params}
          isLoading={props.loading}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
}
