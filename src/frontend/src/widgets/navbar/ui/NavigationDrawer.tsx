import { type Theme, useMediaQuery, Box, Drawer, Toolbar } from '@mui/material';
import { type FC } from 'react';
import { APP_BAR_HEIGHT_SM, SIDEBAR_DRAWER_WIDTH } from '@/shared/constants';
import { NavigationMenuList } from './NavigationMenuList';

interface Props {
  menuOpened: boolean;
  toggleMenu: () => void;
}

export const NavigationDrawer: FC<Props> = ({ menuOpened, toggleMenu }) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
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
      <Box component={Toolbar} display={{ xs: 'block', md: 'none' }} />
      <NavigationMenuList />
    </Drawer>
  );
};
