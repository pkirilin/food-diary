import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink, useMatch } from 'react-router-dom';

interface Props {
  title: string;
  path: string;
}

export const MenuListItem: FC<Props> = ({ title, path }) => {
  const match = useMatch(path);
  const active = !!match;

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={RouterLink}
        to={active ? '' : path}
        selected={active}
        disableTouchRipple={active}
        sx={theme => ({
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            pointerEvents: 'none',
          },
        })}
      >
        <Box component={ListItemIcon}>
          <CalendarMonthIcon />
        </Box>
        <ListItemText primary={title} />
      </ListItemButton>
    </ListItem>
  );
};
