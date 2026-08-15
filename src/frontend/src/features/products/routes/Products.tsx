import { Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useEffect, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { type Product, productLib, productModel } from '@/entities/product';
import { LoadingContainer } from '@/shared/ui';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';

const Products: FC = () => {
  const products = productLib.useProducts();
  const checkedProductIds = productLib.useCheckedProductIds();
  const filterChanged = useAppSelector(state => state.products.filter.changed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      if (filterChanged) {
        dispatch(productModel.actions.filterReset());
      }
    };
  }, [dispatch, filterChanged]);

  const handleCheckedProductsChange = (products: Product[], newCheckedIds: number[]): void => {
    if (newCheckedIds.length > 0) {
      dispatch(productModel.actions.productsUnchecked(products.map(p => p.id)));
    } else {
      dispatch(productModel.actions.productsChecked(products.map(p => p.id)));
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
