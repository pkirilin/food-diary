import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Box, Container, IconButton, Toolbar, Tooltip } from '@mui/material';
import React from 'react';
import { useAuth } from 'src/features/auth';
import { APP_BAR_HEIGHT, APP_NAME } from '../constants';
import BrandLink from './BrandLink';
import Menu from './Menu';
import MobileMenu from './MobileMenu';

const NavigationBar: React.FC = () => {
  const { logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <AppBar component="nav" position="sticky">
      <Container>
        <Box
          id="back-to-top-anchor"
          component={Toolbar}
          disableGutters
          display="flex"
          gap={1}
          height={APP_BAR_HEIGHT}
        >
          <MobileMenu />
          <Box display="flex" justifyContent="space-between" gap={2} flexGrow={1}>
            <Box display="flex" alignItems="center" gap={4}>
              <BrandLink to="/" sx={theme => ({ color: theme.palette.primary.contrastText })}>
                {APP_NAME}
              </BrandLink>
              <Menu />
            </Box>
            <Tooltip title="Logout">
              <IconButton size="large" edge="end" aria-label="Logout" onClick={handleLogout}>
                <LogoutIcon sx={theme => ({ fill: theme.palette.primary.contrastText })} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
};

export default NavigationBar;