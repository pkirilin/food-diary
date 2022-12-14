import { AppBar, Box, Container, Toolbar } from '@mui/material';
import React from 'react';
import { APP_BAR_HEIGHT, APP_NAME } from '../constants';
import BrandLink from './BrandLink';
import Menu from './Menu';
import MobileMenu from './MobileMenu';

type NavigationBarProps = {
  renderLogout: () => React.ReactElement;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ renderLogout }) => {
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
            {renderLogout()}
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
};

export default NavigationBar;
