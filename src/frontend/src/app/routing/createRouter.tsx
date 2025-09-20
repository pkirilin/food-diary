import { createHashRouter } from 'react-router-dom';
import { ErrorPage } from './ErrorPage';

export const createRouter = (): ReturnType<typeof createHashRouter> =>
  createHashRouter([
    {
      lazy: () => import('./AuthenticatedLayout'),
      children: [
        {
          errorElement: <ErrorPage />,
          children: [
            {
              path: '/',
              lazy: () => import('@/pages/ui/IndexPage'),
            },
            {
              path: '/history',
              lazy: () => import('@/pages/ui/HistoryPage'),
            },
            {
              path: '/weight',
              lazy: () => import('@/pages/ui/WeightPage'),
            },
            {
              path: '/products',
              lazy: () => import('@/pages/ui/ProductsPage'),
            },
            {
              path: '/categories',
              lazy: () => import('@/pages/ui/CategoriesPage'),
            },
          ],
        },
      ],
    },
    {
      lazy: () => import('./UnauthenticatedLayout'),
      children: [
        {
          path: '/login',
          lazy: () => import('@/pages/ui/LoginPage'),
        },
        {
          path: '/logout',
          lazy: () => import('@/pages/ui/LogoutPage'),
        },
        {
          path: '/post-login',
          lazy: () => import('@/pages/ui/PostLoginPage'),
        },
        {
          path: 'post-logout',
          lazy: () => import('@/pages/ui/PostLogoutPage'),
        },
      ],
    },
  ]);
