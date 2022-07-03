import { styled } from '@mui/material';
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

const StyledCategoriesList = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export default function CategoriesListNew() {
  return (
    <StyledCategoriesList>
      {MOCK_CATEGORIES.map(category => (
        <CategoryListItemNew key={category.id} category={category}></CategoryListItemNew>
      ))}
    </StyledCategoriesList>
  );
}
