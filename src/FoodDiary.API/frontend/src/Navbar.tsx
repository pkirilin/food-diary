import { AppBar, Box, Container, List, ListItem, styled, Toolbar } from '@mui/material';
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppNavLink } from './components';
import { Logout } from './features/auth/components';

const navLinks = [
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

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const StyledNavBrandLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecoration: `none`,
  fontSize: theme.typography.h5.fontSize,
  fontWeight: 'bold',
}));

const StyledNavMenuList = styled(List)(() => ({
  display: 'flex',
}));

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <StyledToolbar disableGutters id="back-to-top-anchor">
          <StyledNavBrandLink to="/">Food diary</StyledNavBrandLink>
          <Box display="flex" flex={1} justifyContent="space-between" alignItems="center">
            <nav>
              <StyledNavMenuList>
                {navLinks.map(({ title, path }, index) => (
                  <ListItem key={index} disableGutters>
                    <AppNavLink isActive={location.pathname === path} path={path}>
                      {title}
                    </AppNavLink>
                  </ListItem>
                ))}
              </StyledNavMenuList>
            </nav>
            <Logout />
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
