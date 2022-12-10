import { Box } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Logout } from './features/auth/components';
import { useAuth } from './features/auth/hooks';
import { NavigationBar } from './features/navigation';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      {isAuthenticated && <NavigationBar renderLogout={() => <Logout />} />}
      <Box component="main" position="relative">
        <AppRoutes />
      </Box>
    </React.Fragment>
  );
};

export default App;
