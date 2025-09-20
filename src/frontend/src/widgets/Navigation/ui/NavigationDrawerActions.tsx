import LogoutIcon from '@mui/icons-material/Logout';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { useSubmit } from 'react-router';

export const NavigationDrawerActions: FC = () => {
  const submit = useSubmit();

  return (
    <List>
      <ListItem disableGutters disablePadding>
        <ListItemButton
          aria-label="Logout"
          onClick={() => {
            submit(null, { method: 'post', action: '/logout' });
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
