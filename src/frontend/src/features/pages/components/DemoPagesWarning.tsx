import { Alert } from '@mui/material';
import { type FC } from 'react';

const DemoPagesWarning: FC = () => {
  return (
    <Alert severity="warning" title="Warning">
      This application is running in demo mode. Import/export features are disabled
    </Alert>
  );
};

export default DemoPagesWarning;
