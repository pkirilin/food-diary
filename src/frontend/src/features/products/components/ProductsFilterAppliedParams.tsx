import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Chip, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store';
import { useFilterAppliedParamsStyles } from '../../__shared__/styles';
import { filterByCategoryChanged, productSearchNameChanged } from '../store';

const ProductsFilterAppliedParams: FC = () => {
  const classes = useFilterAppliedParamsStyles();
  const productSearchName = useAppSelector(state => state.products.filter.productSearchName);
  const category = useAppSelector(state => state.products.filter.category);
  const dispatch = useAppDispatch();

  if (!productSearchName && !category) {
    return null;
  }

  const handleProductSearchNameClear = (): void => {
    dispatch(productSearchNameChanged(''));
  };

  const handleCategoryClear = (): void => {
    dispatch(filterByCategoryChanged(null));
  };

  return (
    <Box className={classes.root}>
      {productSearchName && (
        <Tooltip title="Applied filter: product search name">
          <Chip
            variant="outlined"
            icon={<SearchIcon />}
            label={productSearchName}
            onDelete={handleProductSearchNameClear}
          />
        </Tooltip>
      )}
      {category && (
        <Tooltip title="Applied filter: category">
          <Chip
            variant="outlined"
            icon={<CategoryIcon />}
            label={category.name}
            onDelete={handleCategoryClear}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default ProductsFilterAppliedParams;
