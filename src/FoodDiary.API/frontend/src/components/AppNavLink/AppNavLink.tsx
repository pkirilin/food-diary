import { ListItemButton } from '@mui/material';
import { lightGreen } from '@mui/material/colors';
import React from 'react';
import { NavLink } from 'react-router-dom';

type AppNavLinkProps = {
  isActive: boolean;
  path: string;
};

const AppNavLink: React.FC<React.PropsWithChildren<AppNavLinkProps>> = ({
  isActive,
  path,
  children,
}) => {
  if (!isActive) {
    return (
      <ListItemButton component={NavLink} to={path}>
        {children}
      </ListItemButton>
    );
  }

  return (
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
      {children}
    </ListItemButton>
  );
};

export default AppNavLink;
