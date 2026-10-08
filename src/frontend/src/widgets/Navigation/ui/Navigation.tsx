import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Skeleton, Typography } from '@mui/material';
import { useLocation, useMatches } from '@tanstack/react-router';
import { type FC, Suspense, useState } from 'react';
import { type AppBarConfig } from '../model';
import { NavigationDrawer } from './NavigationDrawer';

interface AppBarTitleProps {
  title: AppBarConfig['title'];
}

const SlotSkeleton: FC = () => (
  <Typography variant="h6" component="span">
    <Skeleton variant="text" width={120} />
  </Typography>
);

const AppBarTitle: FC<AppBarTitleProps> = ({ title }) => {
  if (typeof title === 'string') {
    return (
      <Typography variant="h6" component="span">
        {title}
      </Typography>
    );
  }

  return (
    <Suspense fallback={<SlotSkeleton />}>
      <title.Component />
    </Suspense>
  );
};

export const Navigation: FC = () => {
  const appBar = useMatches({ select: matches => matches.at(-1)?.staticData.appBar });
  const pathname = useLocation({ select: location => location.pathname });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerPathname, setDrawerPathname] = useState(pathname);

  if (pathname !== drawerPathname) {
    setDrawerPathname(pathname);
    setDrawerVisible(false);
  }

  if (!appBar) {
    return null;
  }

  switch (appBar.variant) {
    case 'menu':
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
            <AppBarTitle title={appBar.title} />
          </Box>
          {appBar.Actions && (
            <Suspense fallback={<SlotSkeleton />}>
              <appBar.Actions />
            </Suspense>
          )}
        </Box>
      );
  }
};
