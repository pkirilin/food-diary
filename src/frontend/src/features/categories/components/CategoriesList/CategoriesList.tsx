import { Grid, Typography } from '@mui/material';
import { type FC } from 'react';
import { type categoryModel } from '@/entities/category';
import CategoriesListItem from '../CategoriesListItem';

interface CategoriesListProps {
  categories: categoryModel.Category[];
}

const CategoriesList: FC<CategoriesListProps> = ({ categories }) => {
  if (categories.length === 0) {
    return <Typography color="GrayText">No categories found</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {categories.map(category => (
        <Grid item xs={12} sm={6} lg={4} key={category.id}>
          <CategoriesListItem category={category} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoriesList;
