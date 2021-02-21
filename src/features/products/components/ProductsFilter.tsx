import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, makeStyles, Paper, TextField } from '@material-ui/core';
import { useInput, useTypedSelector } from '../../__shared__/hooks';
import { CategoryAutocomplete } from '../../categories/components';
import { filterByCategoryChanged, filterReset, productSearchNameChanged } from '../slice';

// TODO: reuse these styles
const useStyles = makeStyles(theme => ({
  root: {
    width: '450px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const ProductsFilter: React.FC = () => {
  const classes = useStyles();

  const filter = useTypedSelector(state => state.products.filter);
  const currentProductSearchName = filter.productSearchName || '';

  const dispatch = useDispatch();

  const productSearchNameInput = useInput(currentProductSearchName);
  const [category, setCategory] = useState(filter.category);

  useEffect(() => {
    productSearchNameInput.setValue(currentProductSearchName);
  }, [filter.productSearchName]);

  useEffect(() => {
    setCategory(filter.category);
  }, [filter.category]);

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
          disabled={!filter.changed}
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
