import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { List } from '@mui/material';
import { Box } from '@mui/system';
import { type FC } from 'react';
import { NavigationMenuListItem } from './NavigationMenuListItem';
import { type NavLink } from './types';

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
    icon: <CalendarMonthIcon />,
    title: 'Pages (deprecated)',
    path: '/pages',
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

export const NavigationMenuList: FC = () => (
  <Box component={List}>
    {NAV_LINKS.map((navLink, index) => (
      <NavigationMenuListItem key={`${index}-${navLink.title}`} navLink={navLink} />
    ))}
  </Box>
);
