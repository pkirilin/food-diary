import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper, TextField } from '@material-ui/core';
import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../slice';
import { CategoryAutocomplete } from '../../categories/components';
import { useInput, useTypedSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';

const ProductsFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterProductName = useTypedSelector(
    state => state.products.filter.productSearchName || '',
  );
  const filterCategory = useTypedSelector(state => state.products.filter.category);
  const filterChanged = useTypedSelector(state => state.products.filter.changed);

  const dispatch = useDispatch();

  const productSearchNameInput = useInput(filterProductName);
  const [category, setCategory] = useState(filterCategory);

  useEffect(() => {
    productSearchNameInput.setValue(filterProductName);
  }, [filterProductName]);

  useEffect(() => {
    setCategory(filterCategory);
  }, [filterCategory]);

  return (
    <Box p={2} component={Paper} className={classes.root}>
      <Box>
        <TextField
          {...productSearchNameInput.binding}
          label="Search by name"
          placeholder="Enter product name"
          fullWidth
          onBlur={event => {
            dispatch(productSearchNameChanged(event.target.value));
          }}
        ></TextField>
      </Box>
      <Box mt={2}>
        <CategoryAutocomplete
          value={category}
          onChange={(event, option) => {
            dispatch(filterByCategoryChanged(option));
          }}
        ></CategoryAutocomplete>
      </Box>
      <Box mt={2} className={classes.controls}>
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
