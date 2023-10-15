import { Box } from '@mui/material';
import React from 'react';
import { useAuthProfileLoad } from './features/auth';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  useAuthProfileLoad();

  return (
    <Box component="main" position="relative">
      <AppRoutes />
    </Box>
  );
};

export default App;
