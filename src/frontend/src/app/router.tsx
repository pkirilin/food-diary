import { createBrowserRouter } from 'react-router-dom';
import { ErrorPage } from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        lazy: async () => await import('@/pages/RootPage'),
      },
    ],
  },
]);
