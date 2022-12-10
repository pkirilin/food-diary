import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Container, IconButton, styled, Toolbar } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  width: '100%',
}));

const StyledNavBrandLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
  fontSize: theme.typography.h5.fontSize,
  fontWeight: 'bold',
}));

type NavigationBarProps = {
  renderLogout: () => React.ReactElement;
};

const NavigationBar: React.FC<NavigationBarProps> = ({ renderLogout }) => {
  return (
    <AppBar position="static">
      <Container>
        <StyledToolbar disableGutters id="back-to-top-anchor">
          <IconButton size="large" edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <StyledNavBrandLink to="/">Food diary</StyledNavBrandLink>
          {renderLogout()}
        </StyledToolbar>
      </Container>
    </AppBar>
  );
};

export default NavigationBar;
