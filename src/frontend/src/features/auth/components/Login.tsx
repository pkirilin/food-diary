import { Box, Paper, Stack } from '@mui/material';
import { type FC } from 'react';
import { AppButton } from 'src/components';
import { DEMO_MODE_ENABLED } from 'src/config';
import { useAuth, useReturnUrl } from '../hooks';
import DemoAuthWarning from './DemoAuthWarning';
import GoogleIcon from './GoogleIcon';
import { AppName } from '@/shared/ui';

const Login: FC = () => {
  const returnUrl = useReturnUrl();
  const { login } = useAuth();

  const handleSignInWithGoogle = (): void => {
    login({ returnUrl });
  };

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
      sx={theme => ({ backgroundColor: theme.palette.grey[100] })}
    >
      <Paper
        component={Stack}
        width={{ xs: '100%', sm: '512px' }}
        p={4}
        spacing={4}
        alignItems="center"
      >
        {DEMO_MODE_ENABLED && <DemoAuthWarning />}
        <AppName />
        <AppButton
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
          Sign in with Google
        </AppButton>
      </Paper>
    </Box>
  );
};

export default Login;
