import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  type Theme,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { type FC } from 'react';
import { Form } from 'react-router-dom';
import { APP_BAR_HEIGHT_SM, SIDEBAR_DRAWER_WIDTH } from '@/shared/constants';
import { APP_NAME } from '../lib';
import { MenuList } from './MenuList';

interface Props {
  menuOpened: boolean;
  toggleMenu: () => void;
}

export const NavigationBar: FC<Props> = ({ menuOpened, toggleMenu }) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        flex={1}
        width="100%"
      >
        <Box display="flex" gap={{ xs: 1, md: 3 }} alignItems="center">
          <IconButton color="inherit" aria-label="Open menu" onClick={toggleMenu}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {APP_NAME}
          </Typography>
        </Box>
        <Box component={Form} method="post" action="/logout">
          <Tooltip title="Logout">
            <IconButton type="submit" aria-label="Logout">
              <LogoutIcon sx={theme => ({ fill: theme.palette.primary.contrastText })} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={menuOpened}
        onClose={toggleMenu}
        ModalProps={{ keepMounted: isMobile }}
        PaperProps={{
          sx: {
            marginTop: { xs: 0, md: `${APP_BAR_HEIGHT_SM}px` },
            width: { xs: '75%', md: `${SIDEBAR_DRAWER_WIDTH}px` },
          },
          component: 'nav',
        }}
      >
        <Box component={AppBar} position="static" display={{ xs: 'block', md: 'none' }}>
          <Box px={1} component={Toolbar} disableGutters>
            <Box display="flex" gap={3} alignItems="center">
              <IconButton color="inherit" aria-label="Close menu" onClick={toggleMenu}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" component="div">
                {APP_NAME}
              </Typography>
            </Box>
          </Box>
        </Box>
        <MenuList />
      </Drawer>
    </>
  );
};
