import { Container } from '@mui/material';
import { createBrowserRouter } from 'react-router-dom';
import { AuthenticatedLayout } from './AuthenticatedLayout';
import { Error } from './Error';
import { UnauthenticatedLayout } from './UnauthenticatedLayout';

export const router = createBrowserRouter([
  {
    element: <AuthenticatedLayout />,
    errorElement: (
      <Container sx={{ py: 2 }}>
        <Error />
      </Container>
    ),
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
    element: <UnauthenticatedLayout />,
    errorElement: (
      <Container sx={{ py: 2 }}>
        <Error />
      </Container>
    ),
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
