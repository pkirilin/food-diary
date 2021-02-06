import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageContentHeader from './PageContentHeader';
import PageContentFooter from './PageContentFooter';
import { MealsList } from '../../notes/components';
import { getPageById } from '../thunks';
import { useRouterId } from '../../__shared__/hooks';

const PageContent: React.FC = () => {
  const pageId = useRouterId('id');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPageById(pageId));
  }, [pageId]);

  return (
    <React.Fragment>
      <PageContentHeader></PageContentHeader>
      <MealsList></MealsList>
      <PageContentFooter></PageContentFooter>
    </React.Fragment>
  );
};

export default PageContent;
