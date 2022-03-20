import { CircularProgress, TextField } from '@material-ui/core';
import { AutocompleteRenderInputParams } from '@material-ui/lab';

type CustomAutocompleteInputProps = {
  renderInputParams: AutocompleteRenderInputParams;
  isLoading?: boolean;
  label?: string;
  placeholder?: string;
};

export default function CustomAutocompleteInput({
  renderInputParams,
  isLoading,
  label,
  placeholder,
}: CustomAutocompleteInputProps) {
  return (
    <TextField
      {...renderInputParams}
      label={label}
      placeholder={placeholder}
      margin="normal"
      InputProps={{
        ...renderInputParams.InputProps,
        endAdornment: isLoading ? <CircularProgress color="inherit" size={20} /> : null,
      }}
    ></TextField>
  );
}
