import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink, useMatch } from 'react-router-dom';
import { type NavLink } from './types';

interface Props {
  navLink: NavLink;
}

export const NavigationMenuListItem: FC<Props> = ({ navLink }) => {
  const match = useMatch(`${navLink.path}/*`);
  const active = !!match;

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={RouterLink}
        to={active ? '' : navLink.path}
        selected={active}
        disableTouchRipple={active}
        sx={theme => ({
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            pointerEvents: 'none',
          },
        })}
      >
        <Box component={ListItemIcon} ml={{ xs: '-3px', sm: '4px' }}>
          {navLink.icon}
        </Box>
        <ListItemText primary={navLink.title} />
      </ListItemButton>
    </ListItem>
  );
};
