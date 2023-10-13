import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

type AuthCallbackProgressProps = {
  label: string;
};

const AuthCallbackProgress: React.FC<AuthCallbackProgressProps> = ({ label }) => {
  return (
    <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
      <Box display="flex" alignItems="center" gap={2} p={4}>
        <CircularProgress />
        <Typography>{label}</Typography>
      </Box>
    </Box>
  );
};

export default AuthCallbackProgress;
