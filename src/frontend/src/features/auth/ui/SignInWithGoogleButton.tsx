import { type FC } from 'react';
import { useAuth, useReturnUrl } from '../hooks';
import GoogleIcon from './GoogleIcon';
import { AppButton } from '@/components';

export const SignInWithGoogleButton: FC = () => {
  const returnUrl = useReturnUrl();
  const { login } = useAuth();

  const handleSignInWithGoogle = (): void => {
    login({ returnUrl });
  };

  return (
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
  );
};
