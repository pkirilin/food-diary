import { Box, Grow, LinearProgress, Stack } from '@mui/material';
import { type FC } from 'react';
import { AppName } from '@/shared/ui';
import { CenteredLayout } from '@/widgets/layout';

export const AppLoader: FC = () => (
  <Grow in>
    <Box>
      <CenteredLayout>
        <Stack p={3} spacing={3} width="100%" alignItems="center">
          <AppName />
          <LinearProgress sx={{ width: '100%' }} />
        </Stack>
      </CenteredLayout>
    </Box>
  </Grow>
);
