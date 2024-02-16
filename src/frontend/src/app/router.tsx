import { createBrowserRouter, redirect } from 'react-router-dom';
import { ErrorPage } from '@/pages/ui/ErrorPage';

export const router = createBrowserRouter([
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
