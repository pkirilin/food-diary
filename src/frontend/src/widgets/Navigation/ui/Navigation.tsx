import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Typography } from '@mui/material';
import { type ReactElement, type FC, useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigation } from 'react-router';
import { NavigationDrawer } from './NavigationDrawer';

export interface NavigationLoaderData {
  navigation: {
    title: string | ReactElement;
    action?: ReactElement;
  };
}

const fallbackNavigation: NavigationLoaderData = {
  navigation: {
    title: '',
  },
};

const isNavigationLoaderData = (data: unknown): data is NavigationLoaderData =>
  typeof data === 'object' && data !== null && 'navigation' in data;

export const Navigation: FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const matches = useMatches();
  const route = matches[matches.length - 1];
  const loaderData = isNavigationLoaderData(route.data) ? route.data : fallbackNavigation;
  const location = useLocation();
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.location?.pathname !== location.pathname) {
      setDrawerVisible(false);
    }
  }, [location.pathname, navigation.location?.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="Open menu"
          onClick={() => {
            setDrawerVisible(visible => !visible);
          }}
        >
          {drawerVisible ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <NavigationDrawer
          visible={drawerVisible}
          toggle={() => {
            setDrawerVisible(false);
          }}
        />
        {typeof loaderData.navigation.title === 'string' ? (
          <Typography variant="h6" component="span">
            {loaderData.navigation.title}
          </Typography>
        ) : (
          loaderData.navigation.title
        )}
      </Box>
      {loaderData.navigation.action}
    </Box>
  );
};
