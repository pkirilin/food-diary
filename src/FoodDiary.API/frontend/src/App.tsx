import { Box } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from './features/auth/hooks';
import Navbar from './Navbar';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      {isAuthenticated && <Navbar />}
      <Box component="main" position="relative">
        <AppRoutes />
      </Box>
    </React.Fragment>
  );
};

export default App;
