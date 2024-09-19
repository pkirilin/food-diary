import { Container } from '@mui/material';
import { type LoaderFunction, createBrowserRouter, redirect } from 'react-router-dom';
import { authApi } from '@/features/auth';
import { ok } from '@/pages/lib';
import { createUrl } from '@/shared/lib';
import { store } from '../store';
import { AuthenticatedLayout } from './AuthenticatedLayout';
import { Error } from './Error';
import { UnauthenticatedLayout } from './UnauthenticatedLayout';

const authLoader: LoaderFunction = async ({ request }) => {
  const authStatusQuery = await store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  if (!authStatusQuery.data?.isAuthenticated) {
    const returnUrl = new URL(request.url).searchParams.get('returnUrl') ?? '/';
    const loginUrl = createUrl('/login', { returnUrl });
    return redirect(loginUrl);
  }

  return ok();
};

export const createRouter = (): ReturnType<typeof createBrowserRouter> =>
  createBrowserRouter([
    {
      loader: authLoader,
      shouldRevalidate: () => true,
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
