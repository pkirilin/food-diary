import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { AutocompleteRenderInputParams } from '@material-ui/lab';

type AutocompleteEndAdornmentProps = {
  loading: boolean;
  params: AutocompleteRenderInputParams;
};

const AutocompleteEndAdornment: React.FC<AutocompleteEndAdornmentProps> = ({
  loading,
  params,
}: AutocompleteEndAdornmentProps) => {
  return (
    <React.Fragment>
      {loading ? <CircularProgress color="inherit" size={20} /> : null}
      {params.InputProps.endAdornment}
    </React.Fragment>
  );
};

export default AutocompleteEndAdornment;
