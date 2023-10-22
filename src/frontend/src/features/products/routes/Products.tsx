import { Box, Container, Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { useAppDispatch } from 'src/hooks';
import { useAppSelector } from 'src/store';
import { useProductsQuery } from '../api';
import CreateProduct from '../components/CreateProduct';
import ProductsFilterAppliedParams from '../components/ProductsFilterAppliedParams';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';
import { selectProductsQueryArg, selectCheckedProductIds } from '../selectors';
import { productsUnchecked, productsChecked } from '../store';
import { Product } from '../types';

const Products: React.FC = () => {
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const dispatch = useAppDispatch();
  const productsQuery = useProductsQuery(productsQueryArg);

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
            products={productsQuery.data?.productItems ?? []}
            isLoading={productsQuery.isFetching}
            checkedIds={checkedProductIds}
            onCheckedChange={handleCheckedProductsChange}
          />
          <ProductsTablePagination />
          <CreateProduct />
        </Paper>
      </Box>
    </Container>
  );
};

export default Products;
