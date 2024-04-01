import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, type Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { type FC } from 'react';
import { Form } from 'react-router-dom';
import { APP_NAME } from '@/shared/constants';

interface Props {
  menuOpened: boolean;
  toggleMenu: () => void;
}

export const NavigationBar: FC<Props> = ({ menuOpened, toggleMenu }) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={1}
      flex={1}
      width="100%"
    >
      <Box display="flex" gap={3} alignItems="center">
        <IconButton
          color="inherit"
          edge="start"
          aria-label={menuOpened ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          {isMobile && menuOpened ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <Typography variant="h6" component="div">
          {APP_NAME}
        </Typography>
      </Box>
      <Box component={Form} method="post" action="/logout">
        <Tooltip title="Logout">
          <IconButton type="submit" edge="end" aria-label="Logout">
            <LogoutIcon sx={theme => ({ fill: theme.palette.primary.contrastText })} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
