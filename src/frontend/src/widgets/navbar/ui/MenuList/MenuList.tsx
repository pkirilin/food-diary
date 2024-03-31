import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { List } from '@mui/material';
import { Box } from '@mui/system';
import { type FC } from 'react';
import { MenuListItem } from './MenuListItem';
import { type NavLink } from './types';

const NAV_LINKS: NavLink[] = [
  {
    icon: <CalendarMonthIcon />,
    title: 'Pages',
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

export const MenuList: FC = () => (
  <Box component={List}>
    {NAV_LINKS.map((navLink, index) => (
      <MenuListItem key={`${index}-${navLink.title}`} navLink={navLink} />
    ))}
  </Box>
);
