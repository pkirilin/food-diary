import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { linkOptions } from '@tanstack/react-router';
import { type FC } from 'react';
import { RouterListItemButton } from '@/shared/ui';

const NAV_LINKS = linkOptions([
  {
    icon: <CalendarTodayIcon />,
    title: 'Today',
    to: '/',
    activeOptions: { exact: true, includeSearch: false },
  },
  {
    icon: <CalendarMonthIcon />,
    title: 'History',
    to: '/history',
  },
  {
    icon: <MonitorWeightIcon />,
    title: 'Weight',
    to: '/weight',
  },
  {
    icon: <RestaurantIcon />,
    title: 'Products',
    to: '/products',
  },
  {
    icon: <CategoryIcon />,
    title: 'Categories',
    to: '/categories',
  },
]);

export const NavigationDrawerMenuList: FC = () => (
  <List>
    {NAV_LINKS.map(({ icon, title, ...link }) => (
      <ListItem key={title} disablePadding>
        <RouterListItemButton
          {...link}
          activeProps={{ selected: true, disableTouchRipple: true }}
          sx={theme => ({
            '&.Mui-selected': {
              backgroundColor: theme.palette.action.selected,
              pointerEvents: 'none',
            },
          })}
        >
          <Box component={ListItemIcon}>{icon}</Box>
          <ListItemText primary={title} />
        </RouterListItemButton>
      </ListItem>
    ))}
  </List>
);
