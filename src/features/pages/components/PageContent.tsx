import React from 'react';
import PageContentBottomNavigation from './PageContentBottomNavigation';
import PageContentHeader from './PageContentHeader';
import { MealsList } from '../../notes/components';

const PageContent: React.FC = () => {
  return (
    <React.Fragment>
      <PageContentHeader></PageContentHeader>
      <MealsList></MealsList>
      <PageContentBottomNavigation></PageContentBottomNavigation>
    </React.Fragment>
  );
};

export default PageContent;
