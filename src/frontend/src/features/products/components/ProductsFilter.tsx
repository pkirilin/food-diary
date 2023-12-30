import { Box, Button, Paper } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CategorySelect, categoriesApi } from 'src/features/categories';
import { type SelectOption } from 'src/types';
import { useAppSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { filterByCategoryChanged, filterReset } from '../store';

const ProductsFilter: FC = () => {
  const classes = useFilterStyles();
  const filterCategory = useAppSelector(state => state.products.filter.category);
  const filterChanged = useAppSelector(state => state.products.filter.changed);
  const [getCategories, categoriesRequest] = categoriesApi.useLazyGetCategorySelectOptionsQuery();
  const dispatch = useDispatch();
  const [category, setCategory] = useState(filterCategory);

  useEffect(() => {
    setCategory(filterCategory);
  }, [filterCategory]);

  const handleCategoryChange = (value: SelectOption | null): void => {
    setCategory(value);
    dispatch(filterByCategoryChanged(value));
  };

  const handleReset = (): void => {
    dispatch(filterReset());
  };

  const handleLoadCategories = async (): Promise<void> => {
    await getCategories();
  };

  return (
    <Box component={Paper} className={classes.root}>
      <CategorySelect
        label="Filter by category"
        placeholder="Select a category"
        value={category}
        setValue={handleCategoryChange}
        options={categoriesRequest.data ?? []}
        optionsLoaded={!categoriesRequest.isUninitialized}
        optionsLoading={categoriesRequest.isLoading}
        onLoadOptions={handleLoadCategories}
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
