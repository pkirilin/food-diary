import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

const StyledNavBrandLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
  fontSize: theme.typography.h5.fontSize,
  fontWeight: 'bold',
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
  fontWeight: 'bold',
  textAlign: 'center',
  padding: theme.spacing(1),
}));

const StyledMobileMenuClose = styled(Box)(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
}));

const StyledListItemText = styled(ListItemText)(() => ({
  textAlign: 'center',
}));

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
      <AppBar position="static">
        <Container>
          <StyledToolbar disableGutters id="back-to-top-anchor">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="Open menu"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <StyledNavBrandLink to="/">Food diary</StyledNavBrandLink>
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
          <StyledMobileMenuHeader>Food diary</StyledMobileMenuHeader>
          <Divider variant="fullWidth" />
          <List disablePadding>
            <ListItem key="one" divider disablePadding>
              <ListItemButton selected>
                <StyledListItemText primary={'one'} />
              </ListItemButton>
            </ListItem>
            <ListItem key="two" divider disablePadding>
              <ListItemButton>
                <StyledListItemText primary={'two'} />
              </ListItemButton>
            </ListItem>
          </List>
          <StyledMobileMenuClose>
            <IconButton size="large" aria-label="Close menu" onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </StyledMobileMenuClose>
        </StyledDrawer>
      </Box>
    </React.Fragment>
  );
};

export default NavigationBar;
