import { Paper, Stack } from '@mui/material';
import { type FC } from 'react';
import { type LoaderFunction, redirect } from 'react-router-dom';
import { ok } from '../lib';
import { authApi, SignInWithGoogleButton } from '@/features/auth';
import { AppName } from '@/shared/ui';
import store from '@/store';
import { CenteredLayout } from '@/widgets/layout';

export const loader: LoaderFunction = async () => {
  const getAuthStatusQuery = await store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  if (getAuthStatusQuery.data?.isAuthenticated) {
    return redirect('/');
  }

  return ok();
};

export const Component: FC = () => (
  <CenteredLayout>
    <Paper p={3} spacing={3} width="100%" alignItems="center" component={Stack}>
      <AppName />
      <SignInWithGoogleButton />
    </Paper>
  </CenteredLayout>
);
