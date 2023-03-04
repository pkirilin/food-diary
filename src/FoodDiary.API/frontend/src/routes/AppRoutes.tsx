import { Navigate, RouteObject, useRoutes } from 'react-router-dom';
import { Login, PostLogin, PostLogout, RequireAuth } from 'src/features/auth';
import { Categories } from 'src/features/categories';
import { Pages } from 'src/features/pages';
import { PageContent } from 'src/features/pages/components';
import { Products } from 'src/features/products';
import NotFound from './NotFound';

const PUBLIC_ROUTES: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/post-login',
    element: <PostLogin />,
  },
  {
    path: '/post-logout',
    element: <PostLogout />,
  },
];

const PRIVATE_ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/pages" />,
  },
  {
    path: '/pages',
    element: <Pages />,
  },
  {
    path: '/pages/:id',
    element: <PageContent />,
  },
  {
    path: '/products',
    element: <Products />,
  },
  {
    path: '/categories',
    element: <Categories />,
  },
];

export default function AppRoutes() {
  const element = useRoutes([
    ...PUBLIC_ROUTES,
    ...PRIVATE_ROUTES.map(route => ({
      ...route,
      element: <RequireAuth>{route.element}</RequireAuth>,
    })),
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return element;
}
