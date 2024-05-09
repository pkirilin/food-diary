import { Box, Button, Collapse, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useUpdateApp } from '../model';

export const UpdateAppBanner: FC = () => {
  const { updateAvailable, reload, close } = useUpdateApp();

  return (
    <Collapse in={updateAvailable}>
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
              <Button onClick={close} variant="text">
                Close
              </Button>
              <Button onClick={reload} variant="text">
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
