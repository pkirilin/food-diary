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
import { selectProductsQueryArg } from '../selectors';
import { allProductsSelected } from '../slice';
import ProductsTableRow from './ProductsTableRow';

const TableLinearProgress = styled(LinearProgress)(() => ({
  top: '61px',
}));

const ProductsTable: React.FC = () => {
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const productsQuery = useProductsQuery(productsQueryArg);
  const operationStatus = useAppSelector(state => state.products.operationStatus);
  const selectedProductsCount = useAppSelector(state => state.products.selectedProductIds.length);
  const dispatch = useAppDispatch();
  const products = productsQuery.data ? productsQuery.data.productItems : [];
  const areAllProductsSelected = products.length > 0 && products.length === selectedProductsCount;

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      productsQuery.refetch();
    }
  }, [operationStatus, productsQuery]);

  function handleSelectAllProducts(): void {
    dispatch(allProductsSelected({ selected: !areAllProductsSelected }));
  }

  function renderTableBody() {
    if (products.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Typography color="textSecondary">No products found</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {products.map(product => (
          <ProductsTableRow key={product.id} product={product} />
        ))}
      </TableBody>
    );
  }

  return (
    <TableContainer>
      {productsQuery.isLoading && <TableLinearProgress />}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={selectedProductsCount > 0 && selectedProductsCount < products.length}
                checked={areAllProductsSelected}
                onChange={handleSelectAllProducts}
                disabled={products.length === 0}
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
        {renderTableBody()}
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
