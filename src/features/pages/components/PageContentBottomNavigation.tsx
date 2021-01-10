import React from 'react';
import { useHistory } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

const previousPageValue = '/pages/:prev';
const currentPageValue = 'current';
const nextPageValue = '/pages/:next';

const PageContentBottomNavigation: React.FC = () => {
  const history = useHistory();

  const handleNavigationChange = (event: React.ChangeEvent<unknown>, newValue: string): void => {
    if ([previousPageValue, nextPageValue].find(v => v === newValue)) {
      history.push(newValue);
    } else if (newValue === currentPageValue) {
      // TODO: scroll to top
    }
  };

  return (
    <BottomNavigation showLabels onChange={handleNavigationChange}>
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
