import { Box, Button } from '@mui/material';
import { type FC } from 'react';
import { Form } from 'react-router-dom';
import GoogleIcon from './GoogleIcon';

export const SignInForm: FC = () => {
  return (
    <Box component={Form} method="post" action="/login" width="100%">
      <Button
        fullWidth
        type="submit"
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
      </Button>
    </Box>
  );
};
