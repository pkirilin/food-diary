import { type FC } from 'react';
import { Categories, categoriesApi } from '@/features/categories';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { ok, withAuthStatusCheck } from '../lib';

export const loader = withAuthStatusCheck(async () => {
  await store.dispatch(categoriesApi.endpoints.getCategories.initiate());
  return ok();
});

export const Component: FC = () => (
  <PrivateLayout>
    <Categories />
  </PrivateLayout>
);
