import { AppBar, LinearProgress, type LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS, SIDEBAR_DRAWER_WIDTH } from '../../constants';

const shouldForwardProp = (prop: PropertyKey): boolean => !prop.toString().startsWith('$');

interface NavigationProgressStyledProps extends LinearProgressProps {
  $withSidebar: boolean;
}

export const NavigationProgressStyled = styled(LinearProgress, {
  shouldForwardProp,
})<NavigationProgressStyledProps>(({ theme, $withSidebar }) => ({
  position: 'absolute',
  zIndex: theme.zIndex.drawer + 1,
  top: APP_BAR_HEIGHT_XS,
  left: 0,
  width: '100%',

  [theme.breakpoints.up('sm')]: {
    left: $withSidebar ? `${SIDEBAR_DRAWER_WIDTH}px` : 0,
    width: $withSidebar ? `calc(100% - ${SIDEBAR_DRAWER_WIDTH}px)` : '100%',
  },

  [theme.breakpoints.up('md')]: {
    top: APP_BAR_HEIGHT_SM,
  },
}));

export const HeaderStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

export const SubheaderStyled = styled(AppBar)(({ theme }) => ({
  top: APP_BAR_HEIGHT_XS,

  [theme.breakpoints.up('sm')]: {
    top: APP_BAR_HEIGHT_SM,
  },
}));

interface MainStyledProps {
  $withSidebar: boolean;
  $withSubheader: boolean;
}

export const MainStyled = styled('main', {
  shouldForwardProp,
})<MainStyledProps>(({ theme, $withSidebar, $withSubheader }) => ({
  paddingTop: $withSubheader ? 0 : theme.spacing(3),
  paddingBottom: theme.spacing(3),

  [theme.breakpoints.up('md')]: {
    marginLeft: $withSidebar ? `${SIDEBAR_DRAWER_WIDTH}px` : 0,
    width: $withSidebar ? `calc(100% - ${SIDEBAR_DRAWER_WIDTH}px)` : '100%',
  },
}));
