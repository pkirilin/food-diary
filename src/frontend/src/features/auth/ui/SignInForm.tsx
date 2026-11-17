import { Box, Button } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { type NavigateToHref, signIn } from '../lib';
import GoogleIcon from './GoogleIcon';

interface Props {
  returnUrl: string;
  navigate: NavigateToHref;
}

export const SignInForm: FC<Props> = ({ returnUrl, navigate }) => {
  const dispatch = useAppDispatch();

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
          void signIn(returnUrl, navigate, dispatch);
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
