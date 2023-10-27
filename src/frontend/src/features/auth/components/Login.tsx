import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppButton } from 'src/components';
import { DEMO_MODE_ENABLED } from 'src/config';
import { useAuth, useReturnUrl } from '../hooks';
import DemoAuthWarning from './DemoAuthWarning';
import GoogleIcon from './GoogleIcon';
import Logo from './Logo';

const Login: React.FC = () => {
  const returnUrl = useReturnUrl();
  const { user, isLoggingIn, login } = useAuth();

  function handleSignInWithGoogle() {
    login({ returnUrl });
  }

  if (user && user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
      sx={theme => ({
        backgroundColor: theme.palette.grey[100],
      })}
    >
      <Paper
        component={Stack}
        width={{
          xs: '100%',
          sm: '512px',
        }}
        p={4}
        spacing={4}
        alignItems="center"
      >
        {DEMO_MODE_ENABLED && <DemoAuthWarning />}
        <Logo />
        <Typography
          variant="h1"
          fontWeight="bold"
          textAlign="center"
          sx={theme => ({ color: theme.palette.primary.main })}
        >
          Food Diary
        </Typography>
        <AppButton
          isLoading={isLoggingIn}
          onClick={handleSignInWithGoogle}
          startIcon={<GoogleIcon />}
          variant="outlined"
          sx={theme => ({
            textTransform: 'none',
            color: theme.palette.text.secondary,
            borderColor: theme.palette.divider,

            '&:hover': {
              borderColor: theme.palette.action.hover,
              backgroundColor: theme.palette.action.hover,
            },
          })}
        >
          {isLoggingIn ? 'Logging in' : 'Sign in with Google'}
        </AppButton>
      </Paper>
    </Box>
  );
};

export default Login;
