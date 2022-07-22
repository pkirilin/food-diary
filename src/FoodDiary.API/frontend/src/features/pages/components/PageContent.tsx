import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import dateFnsFormat from 'date-fns/format';
import PageContentHeader from './PageContentHeader';
import PageContentFooter from './PageContentFooter';
import { MealsList } from '../../notes/components';
import { getPageById } from '../thunks';
import { useAppDispatch, useRouterId, useAppSelector } from '../../__shared__/hooks';
import { getNotes } from '../../notes/thunks';

const PageContent: React.FC = () => {
  const pageId = useRouterId('id');
  const dispatch = useAppDispatch();
  const currentDate = useAppSelector(state => state.pages.current?.date);

  useEffect(() => {
    dispatch(getPageById(pageId));
    dispatch(getNotes({ pageId }));
  }, [dispatch, pageId]);

  return (
    <React.Fragment>
      <Helmet>
        <title>
          {currentDate
            ? `Food diary | ${dateFnsFormat(new Date(currentDate), 'dd.MM.yyyy')}`
            : 'Food diary'}
        </title>
      </Helmet>
      <PageContentHeader />
      <MealsList />
      <PageContentFooter />
    </React.Fragment>
  );
};

export default PageContent;
