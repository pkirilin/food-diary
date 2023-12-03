import { Box, Container, Typography } from '@mui/material';
import { type FC } from 'react';
import { AppLinearProgress } from 'src/components';
import { categoriesApi } from '../api';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';

const Categories: FC = () => {
  const categoriesQuery = categoriesApi.useGetCategoriesQuery();

  return (
    <>
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
    </>
  );
};

export default Categories;
