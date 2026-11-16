import { AppBar, Container, LinearProgress, Toolbar } from '@mui/material';
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { useCallback } from 'react';
import { AUTH_STATUS_MAX_AGE_SECONDS, authApi, useAuthStatusCheckEffect } from '@/features/auth';
import { UpdateAppBanner } from '@/features/updateApp';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { AppLoader } from '@/shared/ui';
import { Navigation } from '@/widgets/Navigation';

export const Route = createFileRoute('/_app')({
  staticData: { appBar: null },
  beforeLoad: async ({ context, location }) => {
    const { data } = await context.store.dispatch(
      authApi.endpoints.getStatus.initiate(
        {},
        { forceRefetch: AUTH_STATUS_MAX_AGE_SECONDS, subscribe: false },
      ),
    );

    if (data?.isAuthenticated !== true) {
      throw redirect({ to: '/login', search: { returnUrl: location.href } });
    }
  },
  pendingComponent: AppLoader,
  pendingMs: 0,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const router = useRouter();
  const loading = useRouterState({ select: state => state.isLoading });
  const handleSessionEnded = useCallback(() => {
    void router.invalidate();
  }, [router]);

  useAuthStatusCheckEffect(handleSessionEnded);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar disableGutters>
          <Container>
            <Navigation />
          </Container>
        </Toolbar>
        <LinearProgress
          sx={theme => ({
            display: loading ? 'block' : 'none',
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
}
