import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { Form } from 'react-router-dom';
import { useToggle } from '@/shared/hooks';
import { APP_NAME } from '../lib';
import { MenuList } from './MenuList';

export const NavigationBar: FC = () => {
  const [menuOpened, toggleMenu] = useToggle();

  return (
    <Box
      component={Toolbar}
      disableGutters
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={1}
      flex={1}
      width="100%"
    >
      <Box display="flex" gap={1} alignItems="center">
        <IconButton edge="start" color="inherit" aria-label="Open menu" onClick={toggleMenu}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div">
          {APP_NAME}
        </Typography>
      </Box>
      <Box component={Form} method="post" action="/logout">
        <Tooltip title="Logout">
          <IconButton type="submit" edge="end" aria-label="Logout">
            <LogoutIcon sx={theme => ({ fill: theme.palette.primary.contrastText })} />
          </IconButton>
        </Tooltip>
      </Box>
      <Drawer
        open={menuOpened}
        onClose={toggleMenu}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: { width: '75%' },
          component: 'nav',
        }}
      >
        <AppBar position="static">
          <Box p={1} component={Toolbar} disableGutters>
            <Box display="flex" gap={3} alignItems="center">
              <IconButton color="inherit" aria-label="Close menu" onClick={toggleMenu}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" component="div">
                {APP_NAME}
              </Typography>
            </Box>
          </Box>
        </AppBar>
        <MenuList />
      </Drawer>
    </Box>
  );
};
