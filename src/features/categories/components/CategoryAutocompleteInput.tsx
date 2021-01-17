import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';

const CategoryAutocompleteInput: React.FC = () => {
  return (
    <Autocomplete
      renderInput={params => (
        <TextField {...params} label="Category" placeholder="Select a category"></TextField>
      )}
      options={[]}
      noOptionsText="No categories found"
    ></Autocomplete>
  );
};

export default CategoryAutocompleteInput;
