import { Link, Typography } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppShell } from '@/shared/ui';
import { useNavigationProgress } from './useNavigationProgress';

export const Error: FC = () => {
  const navigationProgress = useNavigationProgress();

  return (
    <AppShell withNavigationProgress={navigationProgress.visible} withSidebar={false}>
      <Typography variant="h1" gutterBottom>
        Oops!
      </Typography>
      <Typography paragraph>
        Sorry, the page you are looking for does not exist, or an unexpected error has occurred
      </Typography>
      <Link component={RouterLink} to="/">
        Return to home
      </Link>
    </AppShell>
  );
};
