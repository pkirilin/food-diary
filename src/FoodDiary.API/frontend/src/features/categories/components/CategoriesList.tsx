import { Grid } from '@mui/material';
import React from 'react';
import { useCategoriesQuery } from '../api';
import CategoriesListItem from './CategoriesListItem';

const CategoriesList: React.FC = () => {
  const categoriesQuery = useCategoriesQuery();
  const categories = categoriesQuery.data || [];

  return (
    <Grid container spacing={2}>
      {categories?.map(category => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={category.id}>
          <CategoriesListItem category={category} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoriesList;
