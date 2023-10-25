import { Box, Container, Typography } from '@mui/material';
import React from 'react';
import { AppLinearProgress } from 'src/components';
import { categoriesApi } from '../api';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';

const Categories: React.FC = () => {
  const categoriesQuery = categoriesApi.useGetCategoriesQuery();

  return (
    <React.Fragment>
      {categoriesQuery.isFetching && <AppLinearProgress />}
      <Container>
        <Box py={3}>
          <Typography variant="h1" gutterBottom>
            Categories
          </Typography>
          <CategoriesList categories={categoriesQuery.data ?? []} />
          <CreateCategory />
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Categories;
