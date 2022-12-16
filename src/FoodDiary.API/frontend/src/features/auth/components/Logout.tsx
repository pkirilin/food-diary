import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip, IconButton, styled } from '@mui/material';
import React from 'react';
import { useAuth } from '../hooks';

const StyledLogoutIcon = styled(LogoutIcon)(({ theme }) => ({
  fill: theme.palette.background.default,
}));

const Logout: React.FC = () => {
  const { signOut } = useAuth();

  function handleLogoutClick() {
    signOut();
  }

  return (
    <Tooltip title="Logout">
      <IconButton size="large" onClick={handleLogoutClick}>
        <StyledLogoutIcon />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;
