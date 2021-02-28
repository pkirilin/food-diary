import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper, TextField } from '@material-ui/core';
import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../slice';
import { useInput, useTypedSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { SimpleAutocomplete } from '../../__shared__/components';
import { useCategoryAutocompleteInput } from '../../categories/hooks';

const ProductsFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterProductName = useTypedSelector(
    state => state.products.filter.productSearchName || '',
  );
  const filterCategory = useTypedSelector(state => state.products.filter.category);
  const filterChanged = useTypedSelector(state => state.products.filter.changed);

  const dispatch = useDispatch();

  const productSearchNameInput = useInput(filterProductName);
  const [, setCategory, bindCategory] = useCategoryAutocompleteInput(filterCategory);
  const categoryBinding = bindCategory();

  useEffect(() => {
    productSearchNameInput.setValue(filterProductName);
  }, [filterProductName]);

  useEffect(() => {
    setCategory(filterCategory);
  }, [filterCategory]);

  return (
    <Box component={Paper} className={classes.root}>
      <TextField
        {...productSearchNameInput.binding}
        label="Search by name"
        placeholder="Enter product name"
        fullWidth
        margin="normal"
        onBlur={event => {
          dispatch(productSearchNameChanged(event.target.value));
        }}
      ></TextField>
      <SimpleAutocomplete
        {...categoryBinding}
        onChange={(event, option, reason) => {
          const { onChange } = categoryBinding;
          if (onChange) {
            onChange(event, option, reason);
            dispatch(filterByCategoryChanged(option));
          }
        }}
        inputLabel="Filter by category"
        inputPlaceholder="Select a category"
      ></SimpleAutocomplete>
      <Box className={classes.controls}>
        <Button
          variant="text"
          color="default"
          disabled={!filterChanged}
          onClick={() => {
            dispatch(filterReset());
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default ProductsFilter;
