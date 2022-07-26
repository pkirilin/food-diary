import { Box, Button, Paper, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useAppSelector, useValidatedTextInput } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';

import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../slice';
import CategorySelect from './CategorySelect';

const ProductsFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterProductName = useAppSelector(state => state.products.filter.productSearchName || '');
  const filterCategory = useAppSelector(state => state.products.filter.category);
  const filterChanged = useAppSelector(state => state.products.filter.changed);

  const dispatch = useDispatch();

  const [, setProductSearchName, bindProductSearchName] = useValidatedTextInput(filterProductName, {
    validate: productName => productName.length >= 0 && productName.length <= 50,
    errorHelperText: 'Product search name is invalid',
  });

  const [category, setCategory] = useState(filterCategory);

  useEffect(() => {
    setProductSearchName(filterProductName);
  }, [filterProductName, setProductSearchName]);

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
        onBlur={event => dispatch(productSearchNameChanged(event.target.value))}
      />
      <CategorySelect
        label="Filter by category"
        placeholder="Select a category"
        value={category}
        setValue={value => {
          setCategory(value);
          dispatch(filterByCategoryChanged(value));
        }}
      />
      <Box className={classes.controls}>
        <Button variant="text" disabled={!filterChanged} onClick={() => dispatch(filterReset())}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default ProductsFilter;
