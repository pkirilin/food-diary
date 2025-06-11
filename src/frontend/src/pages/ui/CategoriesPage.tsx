import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { store } from '@/app/store';
import { categoryApi } from '@/entities/category';
import { Categories } from '@/features/categories';
import { PageContainer } from '@/shared/ui';
import { ok } from '../lib';

export const loader: LoaderFunction = async () => {
  const categoriesQueryPromise = store.dispatch(categoryApi.endpoints.getCategories.initiate({}));

  try {
    await categoriesQueryPromise;
    return ok();
  } finally {
    categoriesQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => (
  <PageContainer>
    <Categories />
  </PageContainer>
);
