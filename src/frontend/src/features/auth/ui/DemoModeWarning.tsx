import { Alert, AlertTitle, Typography } from '@mui/material';
import { type FC } from 'react';

export const DemoModeWarning: FC = () => (
  <Alert severity="warning">
    <AlertTitle>Demo mode enabled</AlertTitle>
    <Typography component="p" variant="body2" gutterBottom>
      This application is running in demo mode. All its data is mocked, and some features like AI
      integration may not work as expected
    </Typography>
    <Typography component="p" variant="body2">
      To continue, please click sign in button. You will be logged in as a fake user
    </Typography>
  </Alert>
);
