import React, { useEffect, useMemo, useState } from 'react';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteProps } from '@material-ui/lab';
import { useTypedSelector } from '../../__shared__/hooks';
import { CategoryAutocompleteOption } from '../models';
import { useDispatch } from 'react-redux';
import { getCategoriesAutocomplete } from '../thunks';
import { clearAutocompleteOptions } from '../slice';

type AutocompletePropsToInject = Pick<
  AutocompleteProps<CategoryAutocompleteOption, undefined, undefined, undefined>,
  'onChange'
>;

type CategoryAutocompleteProps = {
  initialCategoryId: number | null;
  onChange?: AutocompletePropsToInject['onChange'];
};

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
  initialCategoryId,
  onChange,
}: CategoryAutocompleteProps) => {
  const [open, setOpen] = useState(false);

  const options = useTypedSelector(state => state.categories.autocompleteOptions);
  const loading = open && options.length === 0;

  const initialCategory = useMemo(() => options.find(c => c.id === initialCategoryId), [
    initialCategoryId,
  ]);

  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;

    if (!loading) {
      return;
    }

    dispatch(getCategoriesAutocomplete(active));

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      dispatch(clearAutocompleteOptions());
    }
  }, [open]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      loading={loading}
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
      getOptionLabel={option => option.name}
      noOptionsText="No categories found"
      value={initialCategory}
      onChange={(...args) => {
        if (onChange) {
          onChange(...args);
        }
      }}
    ></Autocomplete>
  );
};

export default CategoryAutocomplete;
