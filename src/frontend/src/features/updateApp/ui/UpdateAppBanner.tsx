import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { useUpdateApp } from '../model';

export const UpdateAppBanner: FC = () => {
  const { updateAvailable, reload, close } = useUpdateApp();

  return (
    <Collapse in={updateAvailable}>
      <Container disableGutters>
        <Box
          component={Paper}
          role="dialog"
          aria-modal="false"
          aria-label="Update app banner"
          square
          variant="elevation"
          tabIndex={-1}
          elevation={0}
          pt={3}
          pb={1}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent={'space-between'}
          alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          gap={{ xs: 0, sm: 1, md: '90px' }}
        >
          <Box display="flex" pl={2} pr={{ xs: 2, sm: 0 }} gap={{ xs: 2, sm: 3 }}>
            <Avatar sx={theme => ({ bgcolor: theme.palette.primary.main })}>
              <BrowserUpdatedIcon />
            </Avatar>
            <Box mb={1}>
              <Typography fontWeight="bold">New update available</Typography>
              <Typography variant="body2">
                Click on reload button to update the application
              </Typography>
            </Box>
          </Box>
          <Box display="flex" px={{ xs: 1, sm: 2 }} gap={1} alignSelf="flex-end">
            <Button onClick={close} variant="text">
              Close
            </Button>
            <Button onClick={reload} variant="text">
              Reload
            </Button>
          </Box>
        </Box>
      </Container>
      <Divider />
    </Collapse>
  );
};
