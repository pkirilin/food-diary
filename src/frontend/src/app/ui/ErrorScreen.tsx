import { type FC } from 'react';
import { ErrorLayout } from './ErrorLayout';
import { ErrorPage } from './ErrorPage';

export const ErrorScreen: FC = () => (
  <ErrorLayout>
    <ErrorPage />
  </ErrorLayout>
);
