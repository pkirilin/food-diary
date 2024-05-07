import { type ReactNode } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { ErrorPage } from '@/pages/ui/ErrorPage';
import { RootPage } from '@/pages/ui/RootPage';

export const createAppRouter = (
  layoutChildren?: ReactNode,
): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter([
    {
      element: <RootPage>{layoutChildren}</RootPage>,
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
          path: '/logout',
          lazy: async () => await import('@/pages/ui/LogoutPage'),
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
