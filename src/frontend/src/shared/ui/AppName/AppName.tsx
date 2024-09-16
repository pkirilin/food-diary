import { Typography, Box, Stack } from '@mui/material';
import { type FC } from 'react';
import { APP_NAME } from '@/shared/constants';
import { Logo } from './Logo';

export const AppName: FC = () => (
  <Stack
    direction="row"
    spacing={3}
    sx={{
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        flexShrink: 0,
      }}
    >
      <Logo />
    </Box>
    <Typography
      variant="h1"
      sx={[
        {
          fontWeight: 'bold',
          textAlign: 'center',
        },
        theme => ({ color: theme.palette.primary.main }),
      ]}
    >
      {APP_NAME}
    </Typography>
  </Stack>
);
