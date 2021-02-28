import React from 'react';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { AutocompleteOption } from '../models';
import { AutocompleteBindingProps } from '../hooks/types';

interface SimpleAutocompleteProps<TOption> extends AutocompleteBindingProps<TOption> {
  inputLabel?: string;
  inputPlaceholder?: string;
}

function SimpleAutocomplete<TOption extends AutocompleteOption>({
  inputLabel,
  inputPlaceholder,
  ...props
}: SimpleAutocompleteProps<TOption>): React.ReactElement {
  return (
    <Autocomplete
      {...props}
      renderInput={params => (
        <TextField
          {...params}
          label={inputLabel}
          placeholder={inputPlaceholder}
          margin="normal"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {props.loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        ></TextField>
      )}
    ></Autocomplete>
  );
}

export default SimpleAutocomplete;
