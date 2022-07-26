import { CircularProgress, TextField, AutocompleteRenderInputParams } from '@mui/material';
import React, { Fragment } from 'react';

type CustomAutocompleteInputProps = {
  renderInputParams: AutocompleteRenderInputParams;
  isLoading?: boolean;
  label?: string;
  placeholder?: string;
};

const CustomAutocompleteInput: React.FC<CustomAutocompleteInputProps> = ({
  renderInputParams,
  isLoading,
  label,
  placeholder,
}) => {
  return (
    <TextField
      {...renderInputParams}
      label={label}
      placeholder={placeholder}
      margin="normal"
      InputProps={{
        ...renderInputParams.InputProps,
        endAdornment: (
          <Fragment>
            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
            {renderInputParams.InputProps.endAdornment}
          </Fragment>
        ),
      }}
    />
  );
};

export default CustomAutocompleteInput;
