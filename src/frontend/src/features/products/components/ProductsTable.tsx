import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { AppLinearProgress } from 'src/components';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useProductsQuery } from '../api';
import { selectCheckedProductIds, selectProductsQueryArg } from '../selectors';
import { productsChecked, productsUnchecked } from '../store';
import ProductsTableRow from './ProductsTableRow';

const ProductsTable: React.FC = () => {
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const dispatch = useAppDispatch();

  const { data: productsQueryData, isFetching: isFetchingProducts } =
    useProductsQuery(productsQueryArg);

  const products = productsQueryData ? productsQueryData.productItems : [];
  const allProductsChecked = products.length > 0 && products.length === checkedProductIds.length;

  function handleCheckedChange() {
    if (checkedProductIds.length > 0) {
      dispatch(productsUnchecked(products.map(p => p.id)));
    } else {
      dispatch(productsChecked(products.map(p => p.id)));
    }
  }

  function renderRows() {
    if (products.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} align="center">
            <Typography color="textSecondary">No products found</Typography>
          </TableCell>
        </TableRow>
      );
    }

    return products.map(product => <ProductsTableRow key={product.id} product={product} />);
  }

  return (
    <TableContainer sx={{ position: 'relative' }}>
      {isFetchingProducts && <AppLinearProgress />}
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
            <TableCell align="right">Calories cost</TableCell>
            <TableCell>Category</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;