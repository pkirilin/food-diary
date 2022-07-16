import { Grid } from '@mui/material';
import { useCategoriesQuery } from '../api';
import CategoryListItemNew from './CategoryListItemNew';

export default function CategoriesListNew() {
  const { data: categories, isLoading } = useCategoriesQuery();

  if (isLoading) {
    return <div role="progressbar">Loading categories...</div>;
  }

  return (
    <Grid container spacing={2}>
      {categories?.map(category => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={category.id}>
          <CategoryListItemNew category={category}></CategoryListItemNew>
        </Grid>
      ))}
    </Grid>
  );
}
