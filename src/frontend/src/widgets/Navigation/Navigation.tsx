import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton } from '@mui/material';
import { type ReactElement, type FC } from 'react';
import { useMatches } from 'react-router-dom';
import { useToggle } from '@/shared/hooks';
import { NavigationDrawer } from '../navbar/ui/NavigationDrawer';

export interface NavigationLoaderData {
  navigation: {
    title: string | (() => ReactElement);
    action?: () => ReactElement;
  };
}

const fallbackNavigation: NavigationLoaderData = {
  navigation: {
    title: '',
  },
};

export const isNavigationLoaderData = (data: unknown): data is NavigationLoaderData =>
  typeof data === 'object' && data !== null && 'navigation' in data;

export const Navigation: FC = () => {
  const [drawerVisible, toggleDrawer] = useToggle();
  const matches = useMatches();
  const route = matches[matches.length - 1];
  const { navigation } = isNavigationLoaderData(route.data) ? route.data : fallbackNavigation;

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
          {drawerVisible ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <NavigationDrawer visible={drawerVisible} toggle={toggleDrawer} />
        {typeof navigation.title === 'string' ? navigation.title : navigation.title()}
      </Box>
      {navigation.action?.()}
    </Box>
  );
};
