import LogoutIcon from '@mui/icons-material/Logout';
import { Tooltip, IconButton, styled } from '@mui/material';
import React from 'react';
import { API_URL } from 'src/config';

const StyledLogoutIcon = styled(LogoutIcon)(({ theme }) => ({
  fill: theme.palette.background.default,
}));

const Logout: React.FC = () => {
  return (
    <Tooltip title="Logout">
      <IconButton href={`${API_URL}/api/v1/account/logout`} size="large">
        <StyledLogoutIcon />
      </IconButton>
    </Tooltip>
  );
};

export default Logout;
