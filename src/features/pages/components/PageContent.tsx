import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageContentHeader from './PageContentHeader';
import PageContentFooter from './PageContentFooter';
import { MealsList } from '../../notes/components';
import { getPageById } from '../thunks';
import { useRouterId } from '../../__shared__/hooks';
import { getNotes } from '../../notes/thunks';

const PageContent: React.FC = () => {
  const pageId = useRouterId('id');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPageById(pageId));
    dispatch(getNotes({ pageId }));
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
