import CloseIcon from '@mui/icons-material/Close';
import { Divider, Drawer, IconButton, Toolbar, Tooltip } from '@mui/material';
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
    <Toolbar sx={{}}>
      <Tooltip title="Close menu">
        <IconButton edge="start" onClick={toggle}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
    <NavigationDrawerMenuList />
    <Divider />
    <NavigationDrawerActions />
  </Drawer>
);
