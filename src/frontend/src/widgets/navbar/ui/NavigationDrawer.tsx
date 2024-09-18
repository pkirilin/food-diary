import { Divider, Drawer } from '@mui/material';
import { type FC } from 'react';
import { SIDEBAR_DRAWER_WIDTH } from '@/shared/constants';
import { NavigationMenuList } from './NavigationMenuList';
import { ProfileActionsList } from './ProfileActionsList';

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
    <NavigationMenuList />
    <Divider />
    <ProfileActionsList />
  </Drawer>
);
