import { Grid } from '@mui/material';
import React from 'react';
import { AppLinearProgress } from 'src/components';
import { useCategoriesQuery } from '../api';
import CategoriesListItem from './CategoriesListItem';

const CategoriesList: React.FC = () => {
  const { data: categories, isFetching } = useCategoriesQuery();

  return (
    <React.Fragment>
      {isFetching && <AppLinearProgress />}
      <Grid container spacing={2}>
        {categories?.map(category => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={category.id}>
            <CategoriesListItem category={category} />
          </Grid>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export default CategoriesList;
