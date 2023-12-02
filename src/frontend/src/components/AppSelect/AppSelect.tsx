import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { type SyntheticEvent, type ReactElement } from 'react';

interface AppSelectProps<TOption> {
  availableOptions: TOption[];
  getDisplayName: (value: TOption) => string;
  areOptionsEqual: (first: TOption, second: TOption) => boolean;
  onChange: (newValue: TOption | null) => void;
  onOpen?: () => void;
  label?: string;
  placeholder?: string;
  value?: TOption | null;
  helperText?: string;
  isLoading?: boolean;
  isInvalid?: boolean;
}

const AppSelect = <TOption,>({
  availableOptions,
  getDisplayName,
  areOptionsEqual,
  onChange,
  onOpen,
  label,
  placeholder,
  value = null,
  helperText,
  isLoading,
  isInvalid,
}: AppSelectProps<TOption>): ReactElement => {
  const handleChange = (event: SyntheticEvent, newValue: TOption | null): void => {
    onChange(newValue);
  };

  return (
    <Autocomplete
      value={value}
      options={availableOptions}
      getOptionLabel={getDisplayName}
      isOptionEqualToValue={areOptionsEqual}
      onChange={handleChange}
      onOpen={onOpen}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={isInvalid}
          helperText={helperText}
          margin="normal"
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
