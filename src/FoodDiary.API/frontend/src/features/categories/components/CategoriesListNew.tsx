import { Grid } from '@mui/material';
import { Category } from '../types';
import CategoryListItemNew from './CategoryListItemNew';

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Bakery',
    countProducts: 1,
  },
  {
    id: 2,
    name: 'Cereals',
    countProducts: 5,
  },
  {
    id: 3,
    name: 'Dairy',
    countProducts: 2,
  },
  {
    id: 4,
    name: 'Frozen Foods',
    countProducts: 0,
  },
];

export default function CategoriesListNew() {
  return (
    <Grid container spacing={2}>
      {MOCK_CATEGORIES.map(category => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={category.id}>
          <CategoryListItemNew category={category}></CategoryListItemNew>
        </Grid>
      ))}
    </Grid>
  );
}
