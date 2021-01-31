import React from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { useAsyncAutocomplete } from '../../__shared__/hooks';
import { CategoryAutocompleteOption } from '../models';
import { getCategoriesAutocomplete } from '../thunks';
import { clearAutocompleteOptions } from '../slice';

type AutocompletePropsToInject = Pick<
  AutocompleteProps<CategoryAutocompleteOption, undefined, undefined, undefined>,
  'onChange'
>;

type CategoryAutocompleteProps = {
  selectedCategory: CategoryAutocompleteOption | null;
  onChange?: AutocompletePropsToInject['onChange'];
};

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  selectedCategory,
  onChange,
}: CategoryAutocompleteProps) => {
  const dispatch = useDispatch();

  const { options, loading, binding } = useAsyncAutocomplete(
    state => state.categories.autocompleteOptions,
    active => {
      dispatch(getCategoriesAutocomplete(active));
    },
    () => {
      dispatch(clearAutocompleteOptions());
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
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        ></TextField>
      )}
      options={options}
      noOptionsText="No categories found"
      value={selectedCategory}
      onChange={(...args) => {
        if (onChange) {
          onChange(...args);
        }
      }}
    ></Autocomplete>
  );
};

export default CategoryAutocomplete;
