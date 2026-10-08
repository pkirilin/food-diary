import LogoutIcon from '@mui/icons-material/Logout';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import { type FC } from 'react';
import { signOut } from '@/features/auth';

export const NavigationDrawerActions: FC = () => {
  const router = useRouter();

  return (
    <List>
      <ListItem disableGutters disablePadding>
        <ListItemButton
          aria-label="Logout"
          onClick={() => {
            void signOut(router.history.push);
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
  );
};
