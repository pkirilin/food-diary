import { Box } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from './features/auth';
import { NavigationBar } from './features/navigation';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      {user?.isAuthenticated && <NavigationBar />}
      <Box component="main" position="relative">
        <AppRoutes />
      </Box>
    </React.Fragment>
  );
};

export default App;
