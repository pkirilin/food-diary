import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Chip, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import { useFilterAppliedParamsStyles } from '../../__shared__/styles';
import { useAppSelector } from '../../__shared__/hooks';
import { filterByCategoryChanged, productSearchNameChanged } from '../slice';

const ProductsFilterAppliedParams: React.FC = () => {
  const classes = useFilterAppliedParamsStyles();

  const productSearchName = useAppSelector(state => state.products.filter.productSearchName);
  const category = useAppSelector(state => state.products.filter.category);

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
            icon={<SearchIcon />}
            label={productSearchName}
            onDelete={() => {
              dispatch(productSearchNameChanged(''));
            }}
          />
        </Tooltip>
      )}
      {category && (
        <Tooltip title="Applied filter: category">
          <Chip
            variant="outlined"
            icon={<CategoryIcon />}
            label={category.name}
            onDelete={() => {
              dispatch(filterByCategoryChanged(null));
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default ProductsFilterAppliedParams;
