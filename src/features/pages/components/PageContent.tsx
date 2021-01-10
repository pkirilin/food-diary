import React from 'react';
import PageContentHeader from './PageContentHeader';
import PageContentFooter from './PageContentFooter';
import { MealsList } from '../../notes/components';

const PageContent: React.FC = () => {
  return (
    <React.Fragment>
      <PageContentHeader></PageContentHeader>
      <MealsList></MealsList>
      <PageContentFooter></PageContentFooter>
    </React.Fragment>
  );
};

export default PageContent;
