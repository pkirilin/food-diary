import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import React from 'react';

type AppSelectProps<TOption> = {
  availableOptions: TOption[];
  getDisplayName: (value: TOption) => string;
  areOptionsEqual: (first: TOption, second: TOption) => boolean;
  onChange: (newValue: TOption | null) => void;
  onOpen?: () => void;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  value?: TOption | null;
};

const AppSelect = <TOption,>({
  availableOptions,
  getDisplayName,
  areOptionsEqual,
  onChange,
  onOpen,
  label,
  placeholder,
  isLoading,
  value = null,
}: AppSelectProps<TOption>): React.ReactElement => {
  function handleChange(event: React.SyntheticEvent, newValue: TOption | null) {
    onChange(newValue);
  }

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
