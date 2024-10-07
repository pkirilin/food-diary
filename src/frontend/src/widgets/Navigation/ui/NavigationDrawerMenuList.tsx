import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { List } from '@mui/material';
import { Box } from '@mui/system';
import { type FC } from 'react';
import { type NavLink } from '../model';
import { NavigationDrawerMenuListItem } from './NavigationDrawerMenuListItem';

const NAV_LINKS: NavLink[] = [
  {
    icon: <CalendarTodayIcon />,
    title: 'Today',
    path: '/',
  },
  {
    icon: <CalendarMonthIcon />,
    title: 'History',
    path: '/history',
  },
  {
    icon: <MonitorWeightIcon />,
    title: 'Weight',
    path: '/weight',
  },
  {
    icon: <RestaurantIcon />,
    title: 'Products',
    path: '/products',
  },
  {
    icon: <CategoryIcon />,
    title: 'Categories',
    path: '/categories',
  },
];

export const NavigationDrawerMenuList: FC = () => (
  <Box component={List}>
    {NAV_LINKS.map((navLink, index) => (
      <NavigationDrawerMenuListItem key={`${index}-${navLink.title}`} navLink={navLink} />
    ))}
  </Box>
);
