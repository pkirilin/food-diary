import LogoutIcon from '@mui/icons-material/Logout';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { useNavigate } from 'react-router';
import { signOut } from '@/features/auth';

export const NavigationDrawerActions: FC = () => {
  const navigate = useNavigate();

  return (
    <List>
      <ListItem disableGutters disablePadding>
        <ListItemButton
          aria-label="Logout"
          onClick={() => {
            void signOut(navigate);
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
