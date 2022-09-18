import { Paper, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { Helmet } from 'react-helmet';
import CreateProduct from '../components/CreateProduct';
import ProductsFilterAppliedParams from '../components/ProductsFilterAppliedParams';
import ProductsTable from '../components/ProductsTable';
import ProductsTablePagination from '../components/ProductsTablePagination';
import ProductsTableToolbar from '../components/ProductsTableToolbar';

const Products: React.FC = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary | Products</title>
      </Helmet>
      <Typography sx={visuallyHidden} variant="h1" gutterBottom>
        Products
      </Typography>
      <Paper>
        <ProductsTableToolbar />
        <ProductsFilterAppliedParams />
        <ProductsTable />
        <ProductsTablePagination />
        <CreateProduct />
      </Paper>
    </React.Fragment>
  );
};

export default Products;
