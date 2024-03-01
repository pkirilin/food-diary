import { Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useEffect, type FC } from 'react';
import { LoadingContainer } from '@/shared/ui';
import { useAppDispatch } from 'src/hooks';
import { useAppSelector } from 'src/store';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';
import { useProducts } from '../model';
import { selectCheckedProductIds } from '../selectors';
import { productsUnchecked, productsChecked, filterReset } from '../store';
import { type Product } from '../types';

const Products: FC = () => {
  const products = useProducts();
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
    <>
      <Typography sx={visuallyHidden} variant="h1" gutterBottom>
        Products
      </Typography>
      <Paper>
        <ProductsTableToolbar />
        <LoadingContainer loading={products.isFetching}>
          <ProductsTable
            products={products.data}
            checkedIds={checkedProductIds}
            onCheckedChange={handleCheckedProductsChange}
          />
        </LoadingContainer>
        <ProductsTablePagination />
      </Paper>
    </>
  );
};

export default Products;
