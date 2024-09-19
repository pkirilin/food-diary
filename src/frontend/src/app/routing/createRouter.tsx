import { createBrowserRouter } from 'react-router-dom';
import { Error } from './Error';

export const createRouter = (): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter([
    {
      lazy: () => import('./AuthenticatedLayout'),
      children: [
        {
          errorElement: <Error />,
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
