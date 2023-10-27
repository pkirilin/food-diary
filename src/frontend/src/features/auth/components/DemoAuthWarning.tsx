import { Alert } from '@mui/material';
import React from 'react';

const DemoAuthWarning: React.FC = () => {
  return (
    <Alert severity="warning">
      {`This application is running in demo mode and is not using real authentication. You will be signed in as a fake user`}
    </Alert>
  );
};

export default DemoAuthWarning;
