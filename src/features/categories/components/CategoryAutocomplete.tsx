import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { AutocompleteEndAdornment } from '../../__shared__/components';
import { useAsyncAutocomplete } from '../../__shared__/hooks';
import { AutocompleteCustomBaseProps } from '../../__shared__/types';
import { getCategoriesAutocomplete } from '../thunks';
import { autocompleteCleared } from '../slice';
import { CategoryAutocompleteOption } from '../models';

type CategoryAutocompleteProps = AutocompleteCustomBaseProps<CategoryAutocompleteOption>;

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  value,
  onChange,
}: CategoryAutocompleteProps) => {
  const dispatch = useDispatch();

  const { loading, binding } = useAsyncAutocomplete(
    { value, onChange },
    state => state.categories.autocompleteOptions,
    active => {
      dispatch(getCategoriesAutocomplete(active));
    },
    () => {
      dispatch(autocompleteCleared());
    },
  );

  return (
    <Autocomplete
      {...binding}
      renderInput={params => (
        <TextField
          {...params}
          label="Category"
          placeholder="Select a category"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <AutocompleteEndAdornment
                loading={loading}
                params={params}
              ></AutocompleteEndAdornment>
            ),
          }}
        ></TextField>
      )}
      noOptionsText="No categories found"
    ></Autocomplete>
  );
};

export default CategoryAutocomplete;
