import React from 'react';
import { Helmet } from 'react-helmet';
import { Paper } from '@material-ui/core';
import ProductsTableToolbar from './ProductsTableToolbar';
import ProductsTable from './ProductsTable';
import ProductsTablePagination from './ProductsTablePagination';

const Products: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Products</title>
      </Helmet>
      <ProductsTableToolbar></ProductsTableToolbar>
      <ProductsTable></ProductsTable>
      <ProductsTablePagination></ProductsTablePagination>
    </Paper>
  );
};

export default Products;
