import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MenuLinks from './MenuLinks';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

const StyledNavBrandLink = styled(RouterLink)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  fontWeight: 800,
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  display: 'block',
  position: 'relative',

  '& .MuiDrawer-paper': {
    width: '75%',
  },

  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

const StyledMobileMenuHeader = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  fontWeight: 800,
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const StyledMobileMenuClose = styled(Box)(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
}));

const StyledMenuOpenButton = styled(IconButton)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

const StyledMenuCloseButton = styled(IconButton)(() => ({}));

const StyledMenuLinksWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const StyledMenu = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const APP_NAME = 'Food diary';

type NavigationBarProps = {
  renderLogout: () => React.ReactElement;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ renderLogout }) => {
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);

  function handleDrawerToggle() {
    setIsDrawerOpened(isOpened => !isOpened);
  }

  return (
    <React.Fragment>
      <AppBar position="static" component="nav">
        <Container>
          <StyledToolbar disableGutters id="back-to-top-anchor">
            <StyledMenuOpenButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="Open menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </StyledMenuOpenButton>
            <StyledMenu>
              <StyledNavBrandLink to="/">{APP_NAME}</StyledNavBrandLink>
              <StyledMenuLinksWrapper>
                <MenuLinks />
              </StyledMenuLinksWrapper>
            </StyledMenu>
            {renderLogout()}
          </StyledToolbar>
        </Container>
      </AppBar>
      <Box component="nav">
        <StyledDrawer
          variant="temporary"
          open={isDrawerOpened}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          <StyledMobileMenuHeader>{APP_NAME}</StyledMobileMenuHeader>
          <Divider variant="fullWidth" />
          <MenuLinks mobile />
          <StyledMobileMenuClose>
            <StyledMenuCloseButton
              size="large"
              aria-label="Close menu"
              onClick={handleDrawerToggle}
            >
              <CloseIcon />
            </StyledMenuCloseButton>
          </StyledMobileMenuClose>
        </StyledDrawer>
      </Box>
    </React.Fragment>
  );
};

export default NavigationBar;
