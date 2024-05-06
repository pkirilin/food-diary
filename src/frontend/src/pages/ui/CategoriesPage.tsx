import { type FC } from 'react';
import { categoryApi } from '@/entities/category';
import { Categories } from '@/features/categories';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { ok, withAuthStatusCheck } from '../lib';

export const loader = withAuthStatusCheck(async () => {
  await store.dispatch(categoryApi.endpoints.getCategories.initiate({}));
  return ok();
});

export const Component: FC = () => (
  <PrivateLayout>
    <Categories />
  </PrivateLayout>
);
