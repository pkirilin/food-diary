import { Typography } from '@mui/material';
import { type FC } from 'react';
import { categoriesApi } from '../api';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';

const Categories: FC = () => {
  const categoriesQuery = categoriesApi.useGetCategoriesQuery();

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Categories
      </Typography>
      <CategoriesList categories={categoriesQuery.data ?? []} />
      <CreateCategory />
    </>
  );
};

export default Categories;
