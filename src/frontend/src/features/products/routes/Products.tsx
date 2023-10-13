import { Box, Container, Paper, Typography } from '@mui/material';
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
    <Container>
      <Helmet>
        <title>Food diary | Products</title>
      </Helmet>
      <Box py={3}>
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
      </Box>
    </Container>
  );
};

export default Products;
