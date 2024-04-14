import { useRegisterSW } from 'virtual:pwa-register/react';
import { Box, Button, Typography } from '@mui/material';
import { type FC } from 'react';

export const ReloadPrompt: FC = () => {
  const registerSw = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();
    },
  });

  const [needRefresh, setNeedRefresh] = registerSw.needRefresh;

  const handleReload = (): void => {
    registerSw.updateServiceWorker(true);
  };

  const handleClose = (): void => {
    setNeedRefresh(false);
  };

  return (
    <Box display={needRefresh ? 'block' : 'none'} p={2}>
      <Typography>New content available, click on reload button to update.</Typography>
      <Button variant="contained" onClick={handleReload}>
        Reload
      </Button>
      <Button variant="text" onClick={handleClose}>
        Close
      </Button>
    </Box>
  );
};
