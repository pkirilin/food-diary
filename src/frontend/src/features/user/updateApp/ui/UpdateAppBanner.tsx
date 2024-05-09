import { useRegisterSW } from 'virtual:pwa-register/react';
import { Box, Button, Collapse, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { useState, type FC, useEffect } from 'react';

export const UpdateAppBanner: FC = () => {
  // const registerSw = useRegisterSW({
  //   onRegisteredSW: async (_, registration) => {
  //     await registration?.update();
  //   },
  // });

  // const [needRefresh, setNeedRefresh] = registerSw.needRefresh;

  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setNeedRefresh(true);
    }, 2000);
  }, []);

  const handleClose = (): void => {
    setNeedRefresh(false);
  };

  const handleReload = (): void => {
    // registerSw.updateServiceWorker(true);
  };

  return (
    <Collapse in={needRefresh}>
      <Container>
        <Paper
          role="dialog"
          aria-modal="false"
          aria-label="Update app banner"
          square
          variant="outlined"
          tabIndex={-1}
          sx={{
            m: 0,
            p: 2,
            borderWidth: 0,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
            <Box
              sx={{
                flexShrink: 1,
                alignSelf: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Typography fontWeight="bold">New update available</Typography>
              <Typography variant="body2">Click on reload button to update</Typography>
            </Box>
            <Stack
              gap={2}
              direction="row"
              sx={{
                flexShrink: 0,
                alignSelf: { xs: 'flex-end', sm: 'center' },
              }}
            >
              <Button onClick={handleClose} variant="text">
                Close
              </Button>
              <Button onClick={handleReload} variant="text">
                Reload
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
      <Divider />
    </Collapse>
  );
};
