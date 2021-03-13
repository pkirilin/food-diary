import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Chip, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CategoryIcon from '@material-ui/icons/Category';
import { useFilterAppliedParamsStyles } from '../../__shared__/styles';
import { useTypedSelector } from '../../__shared__/hooks';
import { filterByCategoryChanged, productSearchNameChanged } from '../slice';

const ProductsFilterAppliedParams: React.FC = () => {
  const classes = useFilterAppliedParamsStyles();

  const productSearchName = useTypedSelector(state => state.products.filter.productSearchName);
  const category = useTypedSelector(state => state.products.filter.category);

  const dispatch = useDispatch();

  if (!productSearchName && !category) {
    return null;
  }

  return (
    <Box className={classes.root}>
      {productSearchName && (
        <Tooltip title="Applied filter: product search name">
          <Chip
            variant="outlined"
            icon={<SearchIcon></SearchIcon>}
            label={productSearchName}
            onDelete={() => {
              dispatch(productSearchNameChanged(''));
            }}
          ></Chip>
        </Tooltip>
      )}
      {category && (
        <Tooltip title="Applied filter: category">
          <Chip
            variant="outlined"
            icon={<CategoryIcon></CategoryIcon>}
            label={category.name}
            onDelete={() => {
              dispatch(filterByCategoryChanged(null));
            }}
          ></Chip>
        </Tooltip>
      )}
    </Box>
  );
};

export default ProductsFilterAppliedParams;
