import { Box } from '@mui/material';
import type React from 'react';
import { AppRoutes } from './routes';

const App: React.FC = () => {
  return (
    <Box component="main" position="relative">
      <AppRoutes />
    </Box>
  );
};

export default App;
