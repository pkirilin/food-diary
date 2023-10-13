import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppButton } from 'src/components';
import { useAuth, useReturnUrl } from '../hooks';
import GoogleIcon from './GoogleIcon';

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
    <Box height="100vh" display="flex" justifyContent="center" alignItems="center" p={4}>
      <Paper
        elevation={4}
        component={Box}
        width={{
          xs: '100%',
          sm: '512px',
        }}
        p={4}
      >
        <Typography
          variant="h1"
          mb={4}
          fontWeight="bold"
          textAlign="center"
          sx={theme => ({
            color: theme.palette.primary.main,
          })}
        >
          🥬 Food Diary
        </Typography>
        <Box display="flex" justifyContent="center">
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
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
