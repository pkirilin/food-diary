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
    <div>
      {MOCK_CATEGORIES.map(category => (
        <CategoryListItemNew key={category.id} category={category}></CategoryListItemNew>
      ))}
    </div>
  );
}
