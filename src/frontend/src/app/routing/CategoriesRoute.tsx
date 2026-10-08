import { type FC } from 'react';
import { type LoaderFunction } from 'react-router';
import { categoryApi } from '@/entities/category';
import { CategoriesPage } from '@/pages/ui/CategoriesPage';
import { store } from '../store';
import { ok } from './reactRouterExtensions';

export const loader: LoaderFunction = async () => {
  const categoriesQueryPromise = store.dispatch(categoryApi.endpoints.getCategories.initiate({}));

  try {
    await categoriesQueryPromise;
    return ok();
  } finally {
    categoriesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => <CategoriesPage />;
