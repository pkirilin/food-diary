import { AppBar, Container, Toolbar } from '@mui/material';
import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useAuthStatusCheckEffect } from '@/features/auth';
import { Navigation } from '@/widgets/Navigation';

export const AuthenticatedLayout: FC = () => {
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
      </AppBar>
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </>
  );
};
