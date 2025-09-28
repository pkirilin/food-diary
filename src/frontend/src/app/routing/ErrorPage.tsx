import { Link, Typography } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink } from 'react-router';

export const ErrorPage: FC = () => {
  return (
    <>
      <Typography variant="h1" gutterBottom>
        Oops!
      </Typography>
      <Typography component="p">
        Sorry, the page you are looking for does not exist, or an unexpected error has occurred
      </Typography>
      <Link component={RouterLink} to="/">
        Return to home
      </Link>
    </>
  );
};
