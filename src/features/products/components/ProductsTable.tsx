import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import ProductsTableRow from './ProductsTableRow';
import { useTypedSelector } from '../../__shared__/hooks';
import { getProducts } from '../thunks';
import { allProductsSelected } from '../slice';

const ProductsTable: React.FC = () => {
  const productItems = useTypedSelector(state => state.products.productItems);
  const changingStatus = useTypedSelector(state => state.products.productItemsChangingStatus);
  const productsFilter = useTypedSelector(state => state.products.filter);
  const selectedProductsCount = useTypedSelector(state => state.products.selectedProductIds.length);

  const areAllProductsSelected =
    productItems.length > 0 && productItems.length === selectedProductsCount;

  const dispatch = useDispatch();

  useEffect(() => {
    if (changingStatus === 'idle' || changingStatus === 'succeeded') {
      const { pageNumber, pageSize, productSearchName, category } = productsFilter;

      dispatch(
        getProducts({
          pageNumber,
          pageSize,
          productSearchName,
          categoryId: category?.id,
        }),
      );
    }
  }, [changingStatus, productsFilter]);

  const handleSelectAllProducts = (): void => {
    dispatch(allProductsSelected({ selected: !areAllProductsSelected }));
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={
                  selectedProductsCount > 0 && selectedProductsCount < productItems.length
                }
                checked={areAllProductsSelected}
                onChange={handleSelectAllProducts}
                disabled={productItems.length === 0}
              ></Checkbox>
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Calories cost</TableCell>
            <TableCell>Category</TableCell>
            <TableCell padding="checkbox"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="textSecondary">No products found</Typography>
              </TableCell>
            </TableRow>
          )}
          {productItems.map(product => (
            <ProductsTableRow key={product.id} product={product}></ProductsTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable;
