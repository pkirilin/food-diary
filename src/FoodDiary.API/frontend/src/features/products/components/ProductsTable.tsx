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
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useProductsQuery } from '../api';
import { selectCheckedProductIds, selectProductsQueryArg } from '../selectors';
import { productsChecked, productsUnchecked } from '../store';
import ProductsTableRow from './ProductsTableRow';

const TableLinearProgress = styled(LinearProgress)(() => ({
  top: '61px',
}));

const ProductsTable: React.FC = () => {
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const productsQuery = useProductsQuery(productsQueryArg);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const dispatch = useAppDispatch();
  const products = productsQuery.data ? productsQuery.data.productItems : [];
  const allProductsChecked = products.length > 0 && products.length === checkedProductIds.length;

  function handleCheckedChange() {
    if (checkedProductIds.length > 0) {
      dispatch(productsUnchecked(products.map(p => p.id)));
    } else {
      dispatch(productsChecked(products.map(p => p.id)));
    }
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
                indeterminate={
                  checkedProductIds.length > 0 && checkedProductIds.length < products.length
                }
                checked={allProductsChecked}
                onChange={handleCheckedChange}
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
