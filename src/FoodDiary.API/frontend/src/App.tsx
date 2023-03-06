import { Box } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary</title>
      </Helmet>
      <Box component="main" position="relative">
        <AppRoutes />
      </Box>
    </React.Fragment>
  );
};

export default App;
