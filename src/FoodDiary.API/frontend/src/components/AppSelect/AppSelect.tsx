import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import React from 'react';

type AppSelectProps<TOption> = {
  availableOptions: TOption[];
  getDisplayName: (value: TOption) => string;
  areOptionsEqual: (first: TOption, second: TOption) => boolean;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  value?: TOption;
  onOpen?: () => void;
};

const AppSelect = <TOption,>({
  availableOptions,
  getDisplayName,
  areOptionsEqual,
  label,
  placeholder,
  isLoading,
  value,
  onOpen,
}: AppSelectProps<TOption>): React.ReactElement => {
  return (
    <Autocomplete
      value={value}
      options={availableOptions}
      getOptionLabel={getDisplayName}
      isOptionEqualToValue={areOptionsEqual}
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
