import { LinearProgress, type LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS, SIDEBAR_DRAWER_WIDTH } from '../../constants';

interface NavigationProgressStyledProps extends LinearProgressProps {
  withSidebar?: boolean;
}

export const NavigationProgressStyled = styled(LinearProgress, {
  shouldForwardProp: prop => prop !== 'withSidebar',
})<NavigationProgressStyledProps>(({ theme, withSidebar }) => ({
  position: 'absolute',
  zIndex: theme.zIndex.drawer + 1,
  top: APP_BAR_HEIGHT_XS,
  left: 0,
  width: '100%',

  [theme.breakpoints.up('md')]: {
    top: APP_BAR_HEIGHT_SM,
  },

  [theme.breakpoints.up('sm')]: {
    left: withSidebar ? `${SIDEBAR_DRAWER_WIDTH}px` : 0,
    width: withSidebar ? `calc(100% - ${SIDEBAR_DRAWER_WIDTH}px)` : '100%',
  },
}));
