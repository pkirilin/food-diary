import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { useAppSelector } from '../../__shared__/hooks';

const currentPageValue = 'current';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'transparent',
  },
  navAction: {
    color: theme.palette.grey[700],

    '&:disabled': {
      color: theme.palette.grey[500],
    },
  },
}));

const PageContentBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  const previousPageId = useAppSelector(state => state.pages.previous?.id);
  const nextPageId = useAppSelector(state => state.pages.next?.id);

  const getNavigationRoute = (pageId?: number): string => {
    return `/pages/${pageId}`;
  };

  const previousPageValue = getNavigationRoute(previousPageId);
  const nextPageValue = getNavigationRoute(nextPageId);

  const getNavigationDisabled = (pageId?: number): boolean => {
    return pageId === undefined;
  };

  const handleNavigationChange = (event: React.SyntheticEvent<unknown>, newValue: string): void => {
    if ([previousPageValue, nextPageValue].find(v => v === newValue)) {
      navigate(newValue);
    } else if (newValue === currentPageValue) {
      const anchor = ((event.target as HTMLDivElement).ownerDocument || document).querySelector(
        '#back-to-top-anchor',
      );

      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <BottomNavigation showLabels onChange={handleNavigationChange} className={classes.root}>
      <BottomNavigationAction
        label="Previous page"
        icon={<ArrowBackIcon />}
        value={previousPageValue}
        disabled={getNavigationDisabled(previousPageId)}
        className={classes.navAction}
      />
      <BottomNavigationAction
        label="Current page"
        icon={<ArrowUpwardIcon />}
        value={currentPageValue}
        className={classes.navAction}
      />
      <BottomNavigationAction
        label="Next page"
        icon={<ArrowForwardIcon />}
        value={nextPageValue}
        disabled={getNavigationDisabled(nextPageId)}
        className={classes.navAction}
      />
    </BottomNavigation>
  );
};

export default PageContentBottomNavigation;
