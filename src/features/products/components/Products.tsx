import React from 'react';
import { Paper } from '@material-ui/core';
import ProductsTableToolbar from './ProductsTableToolbar';
import ProductsTable from './ProductsTable';
import ProductsTablePagination from './ProductsTablePagination';

const Products: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <ProductsTableToolbar></ProductsTableToolbar>
      <ProductsTable></ProductsTable>
      <ProductsTablePagination></ProductsTablePagination>
    </Paper>
  );
};

export default Products;
