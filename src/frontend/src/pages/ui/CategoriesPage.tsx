import { type FC } from 'react';
import { type LoaderFunction } from 'react-router-dom';
import { store } from '@/app/store';
import { categoryApi } from '@/entities/category';
import { Categories } from '@/features/categories';
import { ok } from '../lib';

export const loader: LoaderFunction = async () => {
  await store.dispatch(categoryApi.endpoints.getCategories.initiate({}));
  return ok();
};

export const Component: FC = () => <Categories />;
