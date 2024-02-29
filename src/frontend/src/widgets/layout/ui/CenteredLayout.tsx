import { Box } from '@mui/material';
import { type PropsWithChildren, type FC } from 'react';

export const CenteredLayout: FC<PropsWithChildren> = ({ children }) => (
  <Box height="100vh" bgcolor={theme => theme.palette.grey[100]}>
    <Box
      width={{ xs: '100%', sm: '425px' }}
      p={3}
      sx={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {children}
    </Box>
  </Box>
);
