import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton, Skeleton, Typography } from '@mui/material';
import { useLocation, useMatches, useRouter } from '@tanstack/react-router';
import { type ComponentType, type FC, Suspense, useState } from 'react';
import { type Title } from '../model';
import { NavigationDrawer } from './NavigationDrawer';

interface AppBarTitleProps {
  title: Title;
}

interface AppBarActionsProps {
  Actions: ComponentType | undefined;
}

const SlotSkeleton: FC = () => (
  <Typography variant="h6" component="span">
    <Skeleton variant="text" width={120} />
  </Typography>
);

const AppBarTitle: FC<AppBarTitleProps> = ({ title }) => (
  <Typography variant="h6" component="h1">
    {typeof title === 'string' ? (
      title
    ) : (
      <Suspense fallback={<SlotSkeleton />}>
        <title.Component />
      </Suspense>
    )}
  </Typography>
);

const AppBarActions: FC<AppBarActionsProps> = ({ Actions }) =>
  Actions && (
    <Suspense fallback={<SlotSkeleton />}>
      <Actions />
    </Suspense>
  );

const BackButton: FC = () => {
  const router = useRouter();

  return (
    <IconButton
      color="inherit"
      edge="start"
      aria-label="Back"
      onClick={() => {
        if (router.history.canGoBack()) {
          router.history.back();
        } else {
          void router.navigate({ to: '/' });
        }
      }}
    >
      <ArrowBackIcon />
    </IconButton>
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
          <AppBarActions Actions={appBar.Actions} />
        </Box>
      );
    case 'back':
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
            <BackButton />
            <AppBarTitle title={appBar.title} />
          </Box>
          <AppBarActions Actions={appBar.Actions} />
        </Box>
      );
    case 'search':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
          <BackButton />
          <Box sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: 0, width: { sm: 400 } }}>
            <Suspense fallback={<SlotSkeleton />}>
              <appBar.Search />
            </Suspense>
          </Box>
          <AppBarActions Actions={appBar.Actions} />
        </Box>
      );
  }
};
