import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { type SyntheticEvent, type ReactElement } from 'react';
import { type SelectOption } from 'src/types';

interface AppSelectProps<TOption> {
  options: TOption[];
  onChange: (newValue: TOption | null) => void;
  label?: string;
  placeholder?: string;
  value?: TOption | null;
  helperText?: string;
  isLoading?: boolean;
  isInvalid?: boolean;
  autoFocus?: boolean;
}

const AppSelect = <TOption extends SelectOption>({
  options,
  onChange,
  label,
  placeholder,
  value = null,
  helperText,
  isLoading,
  isInvalid,
  autoFocus,
}: AppSelectProps<TOption>): ReactElement => {
  const getDisplayName = (option: TOption): string => {
    return option.name;
  };

  const areOptionsEqual = (first: SelectOption, second: SelectOption): boolean => {
    return first.name === second.name;
  };

  const handleChange = (event: SyntheticEvent, newValue: TOption | null): void => {
    onChange(newValue);
  };

  return (
    <Autocomplete
      value={value}
      options={options}
      getOptionLabel={getDisplayName}
      isOptionEqualToValue={areOptionsEqual}
      onChange={handleChange}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={isInvalid}
          helperText={helperText}
          margin="normal"
          autoFocus={autoFocus}
          InputProps={{
            ...params.InputProps,
            endAdornment: isLoading ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              params.InputProps.endAdornment
            ),
          }}
        />
      )}
    />
  );
};

export default AppSelect;
