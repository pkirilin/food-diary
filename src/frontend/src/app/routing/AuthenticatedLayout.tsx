import { AppBar, Container, LinearProgress, Toolbar } from '@mui/material';
import { type FC } from 'react';
import {
  type LoaderFunction,
  Outlet,
  ScrollRestoration,
  redirect,
  type ShouldRevalidateFunction,
} from 'react-router-dom';
import { authApi, useAuthStatusCheckEffect } from '@/features/auth';
import { ok } from '@/pages/lib';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { createUrl } from '@/shared/lib';
import { Navigation, useNavigationProgress } from '@/widgets/Navigation';
import { store } from '../store';
import { Error } from './Error';

export const loader: LoaderFunction = async ({ request }) => {
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

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

export const ErrorBoundary: FC = () => (
  <Container sx={{ py: 2 }}>
    <Error />
  </Container>
);

export const Component: FC = () => {
  const progress = useNavigationProgress();

  useAuthStatusCheckEffect();

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
            display: progress.visible ? 'block' : 'none',
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
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </>
  );
};
