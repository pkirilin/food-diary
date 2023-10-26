import { Box, Container, Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { useAppDispatch } from 'src/hooks';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import ProductsFilterAppliedParams from '../components/ProductsFilterAppliedParams';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';
import { selectProductsQueryArg, selectCheckedProductIds } from '../selectors';
import { productsUnchecked, productsChecked } from '../store';
import { Product } from '../types';

const Products: React.FC = () => {
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);
  const getProductsQuery = productsApi.useGetProductsQuery(getProductsQueryArg);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const dispatch = useAppDispatch();

  const handleCheckedProductsChange = (products: Product[], newCheckedIds: number[]): void => {
    if (newCheckedIds.length > 0) {
      dispatch(productsUnchecked(products.map(p => p.id)));
    } else {
      dispatch(productsChecked(products.map(p => p.id)));
    }
  };

  return (
    <Container>
      <Box py={3}>
        <Typography sx={visuallyHidden} variant="h1" gutterBottom>
          Products
        </Typography>
        <Paper>
          <ProductsTableToolbar />
          <ProductsFilterAppliedParams />
          <ProductsTable
            products={getProductsQuery.data?.productItems ?? []}
            isLoading={getProductsQuery.isFetching}
            checkedIds={checkedProductIds}
            onCheckedChange={handleCheckedProductsChange}
          />
          <ProductsTablePagination />
        </Paper>
      </Box>
    </Container>
  );
};

export default Products;
