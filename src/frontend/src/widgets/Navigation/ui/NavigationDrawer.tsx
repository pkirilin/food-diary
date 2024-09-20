import { Divider, Drawer } from '@mui/material';
import { type FC } from 'react';
import { SIDEBAR_DRAWER_WIDTH } from '@/shared/constants';
import { NavigationDrawerActions } from './NavigationDrawerActions';
import { NavigationDrawerMenuList } from './NavigationDrawerMenuList';

interface Props {
  visible: boolean;
  toggle: () => void;
}

export const NavigationDrawer: FC<Props> = ({ visible, toggle }) => (
  <Drawer
    open={visible}
    onClose={toggle}
    ModalProps={{ keepMounted: true }}
    PaperProps={{
      sx: {
        width: `${SIDEBAR_DRAWER_WIDTH}px`,
      },
      component: 'nav',
    }}
  >
    <NavigationDrawerMenuList />
    <Divider />
    <NavigationDrawerActions />
  </Drawer>
);
