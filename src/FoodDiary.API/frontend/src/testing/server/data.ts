import { Category } from 'src/features/categories';
import {
  CreateCategoryRequest,
  DeleteCategoryRequest,
  EditCategoryRequest,
} from 'src/features/categories/api/contracts';

const INITIAL_CATEGORIES: Category[] = [
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

let storedCategories: Category[] = INITIAL_CATEGORIES;

const categories = {
  get: () => storedCategories,

  create: ({ name }: CreateCategoryRequest) => {
    storedCategories.push({
      id: 5,
      name,
      countProducts: 0,
    });
  },

  update: ({ id, name }: EditCategoryRequest) => {
    const categoryToUpdate = storedCategories.find(category => category.id === id);

    storedCategories = [
      ...storedCategories.filter(category => category.id !== id),
      {
        id,
        name,
        countProducts: categoryToUpdate?.countProducts || 0,
      },
    ];
  },

  delete: ({ id }: DeleteCategoryRequest) => {
    storedCategories = storedCategories.filter(category => category.id !== id);
  },

  reset: () => {
    storedCategories = INITIAL_CATEGORIES;
  },
};

export { categories };
