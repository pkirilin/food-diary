import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, type Theme, useMediaQuery } from '@mui/material';
import { type ReactElement, type FC } from 'react';
import { useToggle } from '@/shared/hooks';
import { NavigationDrawer } from '../navbar/ui/NavigationDrawer';

interface Props {
  title: ReactElement;
  action: ReactElement;
}

export const Navigation: FC<Props> = ({ title, action }) => {
  const [drawerVisible, toggleDrawer] = useToggle();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        flex: 1,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'center',
        }}
      >
        <IconButton
          color="inherit"
          edge="start"
          aria-label={drawerVisible ? 'Close menu' : 'Open menu'}
          onClick={toggleDrawer}
        >
          {isMobile && drawerVisible ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <NavigationDrawer visible={drawerVisible} toggle={toggleDrawer} />
        {title}
      </Box>
      {action}
    </Box>
  );
};
