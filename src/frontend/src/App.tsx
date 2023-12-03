import { Box } from '@mui/material';
import { type FC } from 'react';
import { AppRoutes } from './routes';

const App: FC = () => {
  return (
    <Box component="main" position="relative">
      <AppRoutes />
    </Box>
  );
};

export default App;
