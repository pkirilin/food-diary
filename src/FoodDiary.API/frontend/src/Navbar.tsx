import { AppBar, Container, List, ListItem, ListItemButton, styled, Toolbar } from '@mui/material';
import { lightGreen } from '@mui/material/colors';
import React from 'react';
import { NavLink, Link as RouterLink, useLocation } from 'react-router-dom';

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
          <nav>
            <StyledNavMenuList>
              {navLinks.map(({ title, path }, index) => (
                <ListItem key={index} disableGutters>
                  {location.pathname === path ? (
                    <ListItemButton
                      component="a"
                      selected
                      disableRipple
                      disableTouchRipple
                      sx={{
                        pointerEvents: 'none',
                        '&.Mui-selected': {
                          backgroundColor: lightGreen[700],
                        },
                      }}
                    >
                      {title}
                    </ListItemButton>
                  ) : (
                    <ListItemButton component={NavLink} to={path}>
                      {title}
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
            </StyledNavMenuList>
          </nav>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
