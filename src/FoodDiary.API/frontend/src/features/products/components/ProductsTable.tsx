import {
  Checkbox,
  LinearProgress,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useProductsQuery } from '../api';
import { allProductsSelected } from '../slice';
import { ProductsResponse } from '../types';
import ProductsTableRow from './ProductsTableRow';

const TableLinearProgress = styled(LinearProgress)(() => ({
  top: '61px',
}));

const EMPTY_PRODUCTS_RESPONSE: ProductsResponse = {
  productItems: [],
  totalProductsCount: 0,
};

const ProductsTable: React.FC = () => {
  const { pageSize, pageNumber, productSearchName, category } = useAppSelector(
    state => state.products.filter,
  );

  const {
    data: products = EMPTY_PRODUCTS_RESPONSE,
    isLoading,
    refetch: refetchProducts,
  } = useProductsQuery({
    pageSize,
    pageNumber,
    productSearchName,
    categoryId: category?.id,
  });

  const operationStatus = useAppSelector(state => state.products.operationStatus);
  const selectedProductsCount = useAppSelector(state => state.products.selectedProductIds.length);

  const areAllProductsSelected =
    products.productItems.length > 0 && products.productItems.length === selectedProductsCount;

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      refetchProducts();
    }
  }, [operationStatus, refetchProducts]);

  function handleSelectAllProducts(): void {
    dispatch(allProductsSelected({ selected: !areAllProductsSelected }));
  }

  return (
    <TableContainer>
      {isLoading && <TableLinearProgress />}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={
                  selectedProductsCount > 0 && selectedProductsCount < products.productItems.length
                }
                checked={areAllProductsSelected}
                onChange={handleSelectAllProducts}
                disabled={products.productItems.length === 0}
                inputProps={{
                  'aria-label': 'Select all',
                }}
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Calories cost</TableCell>
            <TableCell>Category</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>
          {products.productItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="textSecondary">No products found</Typography>
              </TableCell>
            </TableRow>
          )}
          {products.productItems.map(product => (
            <ProductsTableRow key={product.id} product={product} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
