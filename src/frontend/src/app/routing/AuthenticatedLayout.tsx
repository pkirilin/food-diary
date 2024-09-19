import { AppBar, Container, LinearProgress, Toolbar } from '@mui/material';
import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { Navigation, useNavigationProgress } from '@/widgets/Navigation';

export const AuthenticatedLayout: FC = () => {
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
