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
      {
        path: '/login',
        lazy: async () => await import('@/pages/LoginPage'),
      },
      {
        path: '/pages',
        lazy: async () => await import('@/pages/RootPage'),
      },
      {
        path: '/products',
        lazy: async () => await import('@/pages/ProductsPage'),
      },
    ],
  },
]);