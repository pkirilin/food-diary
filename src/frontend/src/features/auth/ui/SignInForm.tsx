import { Box, Button } from '@mui/material';
import { useEffect, type FC } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { FAKE_AUTH_LOGIN_ON_INIT } from '@/shared/config';
import GoogleIcon from './GoogleIcon';

export const SignInForm: FC = () => {
  const submit = useSubmit();

  useEffect(() => {
    if (FAKE_AUTH_LOGIN_ON_INIT) {
      submit(null, { method: 'POST', action: '/login' });
    }
  }, [submit]);

  return (
    <Box
      component={Form}
      method="post"
      action="/login"
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Button
        type="submit"
        startIcon={<GoogleIcon />}
        variant="outlined"
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
