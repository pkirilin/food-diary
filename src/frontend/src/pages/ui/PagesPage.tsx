import { type FC } from 'react';
import { Pages, pagesApi, toGetPagesRequest } from '@/features/pages';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';
import { ok, withAuthStatusCheck } from '../lib';

export const loader = withAuthStatusCheck(async () => {
  const getPagesRequest = toGetPagesRequest(store.getState().pages.filter);
  await store.dispatch(pagesApi.endpoints.getPages.initiate(getPagesRequest));
  return ok();
});

export const Component: FC = () => (
  <PrivateLayout>
    <Pages />
  </PrivateLayout>
);
