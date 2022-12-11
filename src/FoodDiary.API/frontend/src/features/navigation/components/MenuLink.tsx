import { ListItemButton } from '@mui/material';
import { lightGreen } from '@mui/material/colors';
import React from 'react';
import { NavLink } from 'react-router-dom';

type MenuLinkProps = {
  active: boolean;
  path: string;
};

const MenuLink: React.FC<React.PropsWithChildren<MenuLinkProps>> = ({
  active: isActive,
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
          backgroundColor: lightGreen[800],
        },
      }}
    >
      {children}
    </ListItemButton>
  );
};

export default MenuLink;
