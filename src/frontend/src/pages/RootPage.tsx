import { type FC } from 'react';
import { type LoaderFunction, redirect } from 'react-router-dom';
import { authApi } from '@/features/auth';
import { Pages, pagesApi } from '@/features/pages';
import store from '@/store';
import { SortOrder } from '@/types';
import { PrivateLayout } from '@/widgets/layout';

export const loader: LoaderFunction = async ({ request }) => {
  const authStatusPromise = store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  request.signal.onabort = () => {
    authStatusPromise.abort();
  };

  const authStatusQuery = await authStatusPromise;

  if (!authStatusQuery.data?.isAuthenticated) {
    return redirect('/login');
  }

  const getPagesPromise = store.dispatch(
    pagesApi.endpoints.getPages.initiate({
      startDate: null,
      endDate: null,
      sortOrder: SortOrder.Descending,
      pageNumber: 1,
      pageSize: 10,
    }),
  );

  request.signal.onabort = () => {
    getPagesPromise.abort();
  };

  await getPagesPromise;
  return {};
};

export const Component: FC = () => (
  <PrivateLayout>
    <Pages />
  </PrivateLayout>
);