import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar } from '@mui/material';
import { type FC } from 'react';

export const ReloadPrompt: FC = () => {
  const registerSw = useRegisterSW({
    onRegisteredSW: async (_, registration) => {
      await registration?.update();
    },
  });

  const [needRefresh] = registerSw.needRefresh;

  const handleReload = (): void => {
    registerSw.updateServiceWorker(true);
  };

  return (
    <Snackbar
      open={needRefresh}
      message="New content available, click on reload button to update"
      action={
        <Button variant="text" onClick={handleReload}>
          Reload
        </Button>
      }
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    />
  );
};
