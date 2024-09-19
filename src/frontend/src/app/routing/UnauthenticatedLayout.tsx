import { Container } from '@mui/material';
import { type FC } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Error } from './Error';

export const ErrorBoundary: FC = () => (
  <Container sx={{ py: 2 }}>
    <Error />
  </Container>
);

export const Component: FC = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);
