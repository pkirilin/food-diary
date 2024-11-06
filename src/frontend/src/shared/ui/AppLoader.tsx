import { Box, Grow, LinearProgress, Stack } from '@mui/material';
import { type FC } from 'react';
import { AppName, Center } from '@/shared/ui';

export const AppLoader: FC = () => (
  <Grow in>
    <Box>
      <Center>
        <Stack
          spacing={3}
          sx={{
            p: 3,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <AppName />
          <LinearProgress sx={{ width: '250px' }} />
        </Stack>
      </Center>
    </Box>
  </Grow>
);
