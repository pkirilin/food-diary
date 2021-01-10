import React from 'react';
import { Paper } from '@material-ui/core';
import PageContentBottomNavigation from './PageContentBottomNavigation';
import PageContentHeader from './PageContentHeader';
import { MealsList } from '../../notes/components';

const PageContent: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <PageContentHeader></PageContentHeader>
      <MealsList></MealsList>
      <PageContentBottomNavigation></PageContentBottomNavigation>
    </Paper>
  );
};

export default PageContent;
