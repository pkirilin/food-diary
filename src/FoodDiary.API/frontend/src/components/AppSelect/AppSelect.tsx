import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import React from 'react';

type AppSelectProps<TValue> = {
  availableOptions: TValue[];
  getDisplayName: (value: TValue) => string;
  areOptionsEqual: (first: TValue, second: TValue) => boolean;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  onOpen?: () => void;
};

const AppSelect = <TOption,>({
  availableOptions,
  getDisplayName,
  areOptionsEqual,
  label,
  placeholder,
  isLoading,
  onOpen,
}: AppSelectProps<TOption>): React.ReactElement => {
  return (
    <Autocomplete
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
