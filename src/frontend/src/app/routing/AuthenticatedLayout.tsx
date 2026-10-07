import { AppBar, Container, LinearProgress, Toolbar } from '@mui/material';
import { type FC } from 'react';
import {
  type LoaderFunction,
  Outlet,
  ScrollRestoration,
  redirect,
  type ShouldRevalidateFunction,
  useNavigate,
} from 'react-router';
import { authApi, useAuthStatusCheckEffect } from '@/features/auth';
import { UpdateAppBanner } from '@/features/updateApp';
import { ok } from '@/pages/lib';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { Navigation } from '@/widgets/Navigation';
import { store } from '../store';
import { ErrorLayout } from './ErrorLayout';
import { ErrorPage } from './ErrorPage';
import { useNavigationProgress } from './useNavigationProgress';

export const loader: LoaderFunction = async ({ request }) => {
  const authStatusQueryPromise = store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  try {
    const authStatusQuery = await authStatusQueryPromise;

    if (!authStatusQuery.data?.isAuthenticated) {
      const { pathname, search } = new URL(request.url);
      return redirect(`/login?${new URLSearchParams({ returnUrl: pathname + search })}`);
    }

    return ok();
  } finally {
    authStatusQueryPromise.unsubscribe();
  }
};

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

export const ErrorBoundary: FC = () => (
  <ErrorLayout>
    <ErrorPage />
  </ErrorLayout>
);

export const Component: FC = () => {
  const navigationProgress = useNavigationProgress();
  const navigate = useNavigate();

  useAuthStatusCheckEffect(navigate);

  return (
    <>
      <ScrollRestoration />
      <AppBar position="sticky">
        <Toolbar disableGutters>
          <Container>
            <Navigation />
          </Container>
        </Toolbar>
        <LinearProgress
          sx={theme => ({
            display: navigationProgress.visible ? 'block' : 'none',
            position: 'absolute',
            top: APP_BAR_HEIGHT_XS,
            left: 0,
            width: '100%',

            [theme.breakpoints.up('sm')]: {
              top: APP_BAR_HEIGHT_SM,
            },
          })}
        />
      </AppBar>
      <UpdateAppBanner withAppBar />
      <Outlet />
    </>
  );
};
