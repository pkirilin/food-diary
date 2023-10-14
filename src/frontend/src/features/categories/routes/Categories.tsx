import { Box, Container, Typography } from '@mui/material';
import React from 'react';
import { AppLinearProgress } from 'src/components';
import { useCategoriesQuery } from '../api';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';

const Categories: React.FC = () => {
  const { isFetching: isFetchingCategories } = useCategoriesQuery();

  return (
    <React.Fragment>
      {isFetchingCategories && <AppLinearProgress />}
      <Container>
        <Box py={3}>
          <Typography variant="h1" gutterBottom>
            Categories
          </Typography>
          <CategoriesList />
          <CreateCategory />
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default Categories;
