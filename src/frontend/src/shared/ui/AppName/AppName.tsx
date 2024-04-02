import { Typography, Box, Stack } from '@mui/material';
import { type FC } from 'react';
import { APP_NAME } from '@/shared/constants';
import { Logo } from './Logo';

export const AppName: FC = () => (
  <Stack direction="row" alignItems="center" spacing={3}>
    <Box flexShrink={0}>
      <Logo />
    </Box>
    <Typography
      variant="h1"
      fontWeight="bold"
      textAlign="center"
      sx={theme => ({ color: theme.palette.primary.main })}
    >
      {APP_NAME}
    </Typography>
  </Stack>
);
