import { Box, Button, Paper, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CategorySelect } from 'src/features/categories';
import { SelectOption } from 'src/types';
import { useAppSelector, useValidatedTextInput } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../store';

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

  function handleProductSearchNameBlur(event: React.FocusEvent<HTMLInputElement>) {
    dispatch(productSearchNameChanged(event.target.value));
  }

  function handleCategoryChange(value: SelectOption | null) {
    setCategory(value);
    dispatch(filterByCategoryChanged(value));
  }

  function handleReset() {
    dispatch(filterReset());
  }

  return (
    <Box component={Paper} className={classes.root}>
      <TextField
        {...bindProductSearchName()}
        label="Search by name"
        placeholder="Enter product name"
        fullWidth
        margin="normal"
        onBlur={handleProductSearchNameBlur}
      />
      <CategorySelect
        label="Filter by category"
        placeholder="Select a category"
        value={category}
        setValue={handleCategoryChange}
      />
      <Box className={classes.controls}>
        <Button variant="text" disabled={!filterChanged} onClick={handleReset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default ProductsFilter;
