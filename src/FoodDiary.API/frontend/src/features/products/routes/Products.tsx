import { Paper } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import ProductsFilterAppliedParams from '../components/ProductsFilterAppliedParams';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';

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
