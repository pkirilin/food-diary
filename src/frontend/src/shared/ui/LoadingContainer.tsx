import { Box, CircularProgress, Fade, type FadeProps, useTheme } from '@mui/material';
import { type PropsWithChildren, type FC, useMemo } from 'react';

interface Props extends PropsWithChildren {
  loading: boolean;
}

export const LoadingContainer: FC<Props> = ({ children, loading }) => {
  const theme = useTheme();

  const timeout = useMemo<FadeProps['timeout']>(
    () => ({
      enter: theme.transitions.duration.enteringScreen,
      exit: 0,
    }),
    [theme.transitions.duration.enteringScreen],
  );

  return (
    <Box position="relative">
      <Fade in={loading} timeout={timeout}>
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '30%',
            left: '50%',
          }}
        />
      </Fade>
      <Box
        sx={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
