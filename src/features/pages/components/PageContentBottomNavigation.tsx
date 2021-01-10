import React from 'react';
import { useHistory } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, makeStyles } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

const previousPageValue = '/pages/:prev';
const currentPageValue = 'current';
const nextPageValue = '/pages/:next';

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'transparent',
  },
}));

const PageContentBottomNavigation: React.FC = () => {
  const history = useHistory();
  const classes = useStyles();

  const handleNavigationChange = (event: React.ChangeEvent<unknown>, newValue: string): void => {
    if ([previousPageValue, nextPageValue].find(v => v === newValue)) {
      history.push(newValue);
    } else if (newValue === currentPageValue) {
      // TODO: scroll to top
    }
  };

  return (
    <BottomNavigation showLabels onChange={handleNavigationChange} className={classes.root}>
      <BottomNavigationAction
        label="Previous page"
        icon={<ArrowBackIcon />}
        value={previousPageValue}
      />
      <BottomNavigationAction
        label="Current page"
        icon={<ArrowUpwardIcon />}
        value={currentPageValue}
      />
      <BottomNavigationAction label="Next page" icon={<ArrowForwardIcon />} value={nextPageValue} />
    </BottomNavigation>
  );
};

export default PageContentBottomNavigation;
