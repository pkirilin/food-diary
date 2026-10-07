import { Box, Button } from '@mui/material';
import { useEffect, type FC, useRef } from 'react';
import { FAKE_AUTH_LOGIN_ON_INIT } from '@/shared/config';
import { type NavigateToHref, signIn } from '../lib';
import GoogleIcon from './GoogleIcon';

interface Props {
  returnUrl: string;
  navigate: NavigateToHref;
}

export const SignInForm: FC<Props> = ({ returnUrl, navigate }) => {
  const hasAutoSignedInRef = useRef(false);

  useEffect(() => {
    if (FAKE_AUTH_LOGIN_ON_INIT && !hasAutoSignedInRef.current) {
      hasAutoSignedInRef.current = true;
      void signIn(returnUrl, navigate);
    }
  }, [returnUrl, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Button
        startIcon={<GoogleIcon />}
        variant="outlined"
        onClick={() => {
          void signIn(returnUrl, navigate);
        }}
        sx={theme => ({
          width: '250px',
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
      </Button>
    </Box>
  );
};
