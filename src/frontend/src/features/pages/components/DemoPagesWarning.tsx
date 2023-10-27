import { Alert } from '@mui/material';

const DemoPagesWarning: React.FC = () => {
  return (
    <Alert severity="warning" title="Warning">
      This application is running in demo mode. Import/export features are disabled
    </Alert>
  );
};

export default DemoPagesWarning;
