import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Paper,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material';
import { type FC } from 'react';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { useUpdateApp } from './useUpdateApp';

interface Props {
  withAppBar?: boolean;
}

const fixedTopStyle: SxProps<Theme> = () => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
});

const stickyStyle: SxProps<Theme> = theme => ({
  position: 'sticky',
  top: APP_BAR_HEIGHT_XS,
  zIndex: theme.zIndex.appBar - 1,

  [theme.breakpoints.up('sm')]: {
    top: APP_BAR_HEIGHT_SM,
  },
});

export const UpdateAppBanner: FC<Props> = ({ withAppBar }) => {
  const { updateAvailable, reload, close } = useUpdateApp();

  return (
    <Collapse in={updateAvailable} sx={withAppBar ? stickyStyle : fixedTopStyle}>
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
          sx={{
            pt: 3,
            pb: 1,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            gap: { xs: 0, sm: 1, md: '90px' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              pl: 2,
              pr: { xs: 2, sm: 0 },
              gap: { xs: 2, sm: 3 },
            }}
          >
            <Avatar sx={theme => ({ bgcolor: theme.palette.primary.main })}>
              <BrowserUpdatedIcon />
            </Avatar>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 'bold' }}>New update available</Typography>
              <Typography variant="body2">
                Click on reload button to update the application
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              px: { xs: 1, sm: 2 },
              gap: 1,
              alignSelf: 'flex-end',
            }}
          >
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
