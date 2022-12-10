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

  '& .MuiDrawer-paper': {
    width: '240px',
  },

  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
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
          <Typography component={'div'}>Food diary</Typography>
          <Divider sx={{ width: '100%' }} />
          <List>
            <ListItem key="one" disablePadding>
              <ListItemButton>
                <ListItemText primary={'one'} />
              </ListItemButton>
            </ListItem>
            <ListItem key="two" disablePadding>
              <ListItemButton>
                <ListItemText primary={'two'} />
              </ListItemButton>
            </ListItem>
          </List>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="Close menu"
            onClick={handleDrawerToggle}
          >
            <CloseIcon />
          </IconButton>
        </StyledDrawer>
      </Box>
    </React.Fragment>
  );
};

export default NavigationBar;
