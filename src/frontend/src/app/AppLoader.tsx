import { Box, Grow, LinearProgress, Stack } from '@mui/material';
import { type FC } from 'react';
import { AppName } from '@/shared/ui';

export const AppLoader: FC = () => (
  <Grow in>
    <Box
      height="100vh"
      width={{ xs: '100%', sm: '512px' }}
      margin="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
    >
      <Stack p={3} alignItems="center" spacing={3} width="100%">
        <AppName />
        <LinearProgress sx={{ width: '100%' }} />
      </Stack>
    </Box>
  </Grow>
);
