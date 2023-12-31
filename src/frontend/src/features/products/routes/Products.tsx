import { Box, Container, Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useEffect, type FC } from 'react';
import { useAppDispatch } from 'src/hooks';
import { useAppSelector } from 'src/store';
import { productsApi } from '../api';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';
import { selectProductsQueryArg, selectCheckedProductIds } from '../selectors';
import { productsUnchecked, productsChecked, filterReset } from '../store';
import { type Product } from '../types';

const Products: FC = () => {
  const getProductsQueryArg = useAppSelector(selectProductsQueryArg);
  const getProductsQuery = productsApi.useGetProductsQuery(getProductsQueryArg);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const filterChanged = useAppSelector(state => state.products.filter.changed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      if (filterChanged) {
        dispatch(filterReset());
      }
    };
  }, [dispatch, filterChanged]);

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
