import { Box, Container, Paper, Stack } from '@mui/material';
import { type FC } from 'react';
import { DemoModeWarning, type NavigateToHref, SignInForm } from '@/features/auth';
import { UpdateAppBanner } from '@/features/updateApp';
import { DEMO_MODE_ENABLED } from '@/shared/config';
import { AppName, Center } from '@/shared/ui';

interface Props {
  returnUrl: string;
  navigate: NavigateToHref;
}

export const LoginPage: FC<Props> = ({ returnUrl, navigate }) => {
  return (
    <>
      <Box
        component={Paper}
        elevation={0}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <UpdateAppBanner />
      </Box>
      <Center>
        <Container maxWidth="md" disableGutters>
          {DEMO_MODE_ENABLED && (
            <Box sx={{ mb: 3 }}>
              <DemoModeWarning />
            </Box>
          )}
          <Paper
            component={Stack}
            spacing={3}
            sx={{
              p: { xs: 3, sm: 4 },
              margin: 'auto',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <AppName />
            <SignInForm returnUrl={returnUrl} navigate={navigate} />
          </Paper>
        </Container>
      </Center>
    </>
  );
};
