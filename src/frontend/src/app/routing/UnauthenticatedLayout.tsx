import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { UpdateAppBanner } from '@/features/updateApp';
import { ErrorLayout } from './ErrorLayout';
import { ErrorPage } from './ErrorPage';

export const ErrorBoundary: FC = () => (
  <ErrorLayout>
    <ErrorPage />
  </ErrorLayout>
);

export const Component: FC = () => (
  <>
    <ScrollRestoration />
    <UpdateAppBanner />
    <Outlet />
  </>
);
