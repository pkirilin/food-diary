import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper, TextField } from '@material-ui/core';
import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../slice';
import { useTypedSelector, useValidatedTextInput } from '../../__shared__/hooks';
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

  const [, setProductSearchName, bindProductSearchName] = useValidatedTextInput(filterProductName, {
    validate: productName => productName.length >= 0 && productName.length <= 50,
    errorHelperText: 'Product search name is invalid',
  });

  const [, setCategory, bindCategory] = useCategoryAutocompleteInput(filterCategory);

  useEffect(() => {
    setProductSearchName(filterProductName);
  }, [filterProductName]);

  useEffect(() => {
    setCategory(filterCategory);
  }, [filterCategory]);

  return (
    <Box component={Paper} className={classes.root}>
      <TextField
        {...bindProductSearchName()}
        label="Search by name"
        placeholder="Enter product name"
        fullWidth
        margin="normal"
        onBlur={event => {
          dispatch(productSearchNameChanged(event.target.value));
        }}
      ></TextField>
      <SimpleAutocomplete
        {...bindCategory()}
        onChange={(event, option, reason) => {
          const { onChange } = bindCategory();
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
