import { Box, Paper, Stack } from '@mui/material';
import { type FC } from 'react';
import {
  type LoaderFunction,
  redirect,
  type ActionFunction,
  redirectDocument,
} from 'react-router-dom';
import { store } from '@/app/store';
import { authApi, SignInForm } from '@/features/auth';
import { UpdateAppBanner } from '@/features/updateApp';
import { API_URL, FAKE_AUTH_ENABLED } from '@/shared/config';
import { createUrl } from '@/shared/lib';
import { AppName, Center } from '@/shared/ui';
import { ok } from '../lib';

export const loader: LoaderFunction = async () => {
  const authStatusQueryPromise = store.dispatch(
    authApi.endpoints.getStatus.initiate({}, { forceRefetch: true }),
  );

  try {
    const authStatusQuery = await authStatusQueryPromise;

    if (authStatusQuery.data?.isAuthenticated) {
      return redirect('/');
    }

    return ok();
  } finally {
    authStatusQueryPromise.unsubscribe();
  }
};

export const action: ActionFunction = async ({ request }) => {
  const returnUrl = new URL(request.url).searchParams.get('returnUrl') ?? '/';

  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signInById(1);
    return redirect(returnUrl);
  }

  const loginUrl = createUrl(`${API_URL}/api/v1/auth/login`, { returnUrl });
  return redirectDocument(loginUrl);
};

export const Component: FC = () => (
  <>
    <Box
      component={Paper}
      elevation={0}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <UpdateAppBanner />
    </Box>
    <Center>
      <Paper p={{ xs: 3, sm: 4 }} spacing={3} width="100%" alignItems="center" component={Stack}>
        <AppName />
        <SignInForm />
      </Paper>
    </Center>
  </>
);
