import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip, IconButton, styled } from '@mui/material';
import React from 'react';

const StyledLogoutIcon = styled(LogoutIcon)(({ theme }) => ({
  fill: theme.palette.background.default,
}));

const Logout: React.FC = () => {
  return (
    <Tooltip title="Logout">
      <IconButton>
        <StyledLogoutIcon />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;
