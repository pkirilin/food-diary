import { Typography } from '@mui/material';
import { type FC } from 'react';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';
import { useCategories } from '../model';

const Categories: FC = () => {
  const categories = useCategories();

  return (
    <>
      <Typography variant="h1" gutterBottom>
        Categories
      </Typography>
      <CategoriesList categories={categories.data} />
      <CreateCategory />
    </>
  );
};

export default Categories;
