import { Typography } from '@mui/material';
import { type FC } from 'react';
import { RouterLink } from '@/shared/ui';

export const NotFoundPage: FC = () => {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        Page not found
      </Typography>
      <RouterLink to="/">Go to diary</RouterLink>
    </>
  );
};
