import { Box } from '@mui/material';
import { type PropsWithChildren, type FC } from 'react';

export const CenteredLayout: FC<PropsWithChildren> = ({ children }) => (
  <Box bgcolor={theme => theme.palette.grey[100]}>
    <Box
      height="100vh"
      width={{ xs: '100%', sm: '425px' }}
      margin="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={3}
    >
      {children}
    </Box>
  </Box>
);
