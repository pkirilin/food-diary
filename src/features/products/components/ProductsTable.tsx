import React from 'react';
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
import { ProductItem } from '../models';
import ProductsTableRow from './ProductsTableRow';

const productItems: ProductItem[] = [
  {
    id: 1,
    name: 'Product 1',
    caloriesCost: 100,
    categoryId: 1,
    categoryName: 'Category',
  },
  {
    id: 2,
    name: 'Product 2',
    caloriesCost: 200,
    categoryId: 1,
    categoryName: 'Category',
  },
  {
    id: 3,
    name: 'Product 3',
    caloriesCost: 300,
    categoryId: 3,
    categoryName: 'Category',
  },
];

const ProductsTable: React.FC = () => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox disabled></Checkbox>
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
