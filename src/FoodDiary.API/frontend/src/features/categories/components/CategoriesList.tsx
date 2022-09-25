import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useCategoriesQuery } from '../api';
import CategoriesListItem from './CategoriesListItem';

const CategoriesList: React.FC = () => {
  const { data: categoriesQueryData } = useCategoriesQuery();
  const categories = categoriesQueryData || [];

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
