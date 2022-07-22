import React from 'react';
import { Helmet } from 'react-helmet';
import { Paper } from '@mui/material';
import ProductsTableToolbar from './ProductsTableToolbar';
import ProductsTable from './ProductsTable';
import ProductsTablePagination from './ProductsTablePagination';
import ProductsFilterAppliedParams from './ProductsFilterAppliedParams';

const Products: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Products</title>
      </Helmet>
      <ProductsTableToolbar />
      <ProductsFilterAppliedParams />
      <ProductsTable />
      <ProductsTablePagination />
    </Paper>
  );
};

export default Products;
