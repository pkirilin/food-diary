import { Box, CircularProgress, Typography } from '@mui/material';
import { type FC } from 'react';

interface Props {
  label: string;
}

export const AuthCallbackProgress: FC<Props> = ({ label }) => (
  <Box
    sx={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 4,
      }}
    >
      <CircularProgress />
      <Typography>{label}</Typography>
    </Box>
  </Box>
);
