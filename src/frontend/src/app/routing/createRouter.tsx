import { createHashRouter, type RouteObject } from 'react-router';
import { AppLoader } from '@/shared/ui';
import { ErrorPage } from './ErrorPage';

export const routes: RouteObject[] = [
  {
    HydrateFallback: AppLoader,
    children: [
      {
        lazy: () => import('./AuthenticatedLayout'),
        children: [
          {
            errorElement: <ErrorPage />,
            children: [
              {
                path: '/',
                lazy: () => import('./IndexRoute'),
              },
              {
                path: '/history',
                lazy: () => import('./HistoryRoute'),
              },
              {
                path: '/weight',
                lazy: () => import('./WeightRoute'),
              },
              {
                path: '/products',
                lazy: () => import('./ProductsRoute'),
              },
              {
                path: '/categories',
                lazy: () => import('./CategoriesRoute'),
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
            lazy: () => import('./LoginRoute'),
          },
          {
            path: '/post-login',
            lazy: () => import('./PostLoginRoute'),
          },
          {
            path: '/post-logout',
            lazy: () => import('./PostLogoutRoute'),
          },
        ],
      },
    ],
  },
];

export const createRouter = (): ReturnType<typeof createHashRouter> => createHashRouter(routes);
