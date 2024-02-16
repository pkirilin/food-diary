import { createBrowserRouter, redirect } from 'react-router-dom';
import { ErrorPage } from '@/pages/ui/ErrorPage';

export const createAppRouter = (): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter([
    {
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          loader: () => redirect('/pages'),
        },
        {
          path: '/login',
          lazy: async () => await import('@/pages/ui/LoginPage'),
        },
        {
          path: '/post-login',
          lazy: async () => await import('@/pages/ui/PostLoginPage'),
        },
        {
          path: 'post-logout',
          lazy: async () => await import('@/pages/ui/PostLogoutPage'),
        },
        {
          path: '/pages',
          lazy: async () => await import('@/pages/ui/PagesPage'),
        },
        {
          path: '/pages/:id',
          lazy: async () => await import('@/pages/ui/PageDetailPage'),
        },
        {
          path: '/products',
          lazy: async () => await import('@/pages/ui/ProductsPage'),
        },
        {
          path: '/categories',
          lazy: async () => await import('@/pages/ui/CategoriesPage'),
        },
      ],
    },
  ]);
