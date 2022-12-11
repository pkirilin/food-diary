import { List, ListItem, ListItemText, styled } from '@mui/material';
import React from 'react';
import { useLocation } from 'react-router-dom';
import MenuLink from './MenuLink';

const NAV_LINKS = [
  {
    title: 'Pages',
    path: '/pages',
  },
  {
    title: 'Products',
    path: '/products',
  },
  {
    title: 'Categories',
    path: '/categories',
  },
];

const StyledList = styled(List)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    display: 'flex',
  },
}));

const StyledListItemText = styled(ListItemText)(() => ({
  textAlign: 'center',
}));

type MenuLinksProps = {
  mobile?: boolean;
};

const MenuLinks: React.FC<MenuLinksProps> = ({ mobile: isMobile }) => {
  const location = useLocation();

  return (
    <StyledList disablePadding>
      {NAV_LINKS.map(({ title, path }, index) => (
        <ListItem key={`${index}-${title}`} divider={isMobile} disablePadding={isMobile}>
          <MenuLink active={location.pathname.startsWith(path)} path={path}>
            <StyledListItemText primary={title} />
          </MenuLink>
        </ListItem>
      ))}
    </StyledList>
  );
};

export default MenuLinks;
