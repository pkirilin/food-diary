import { Paper } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import ProductsFilterAppliedParams from './ProductsFilterAppliedParams';
import ProductsTable from './ProductsTable';
import ProductsTablePagination from './ProductsTablePagination';
import ProductsTableToolbar from './ProductsTableToolbar';

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
