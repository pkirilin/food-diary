import { Alert } from '@mui/material';
import { type FC } from 'react';

const DemoAuthWarning: FC = () => {
  return (
    <Alert severity="warning">
      {`This application is running in demo mode and is not using real authentication. You will be signed in as a fake user`}
    </Alert>
  );
};

export default DemoAuthWarning;
