import React, { useEffect } from 'react';
import './PageContent.scss';
import { useParams } from 'react-router-dom';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PageContentConnected';
import Loader from '../Loader';
import PageContentHeaderConnected from '../PageContentHeader';
import MealsListConnected from '../MealsList';

interface PageContentProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PageContent: React.FC<PageContentProps> = ({ notesForPageFetchState, getNotesForPage }: PageContentProps) => {
  const { id: pageId } = useParams();

  useEffect(() => {
    const getContentAsync = async (): Promise<void> => {
      if (pageId && !isNaN(+pageId)) {
        await getNotesForPage({ pageId: +pageId });
        window.scrollTo(0, 0);
      }
    };

    getContentAsync();
  }, [pageId, getNotesForPage]);

  const { loading } = notesForPageFetchState;

  return (
    <div className="page-content">
      <div className="page-content__top-panel">
        <PageContentHeaderConnected></PageContentHeaderConnected>
      </div>
      {loading && (
        <div className="page-content__preloader">
          <Loader label="Loading page content"></Loader>
        </div>
      )}
      <MealsListConnected></MealsListConnected>
    </div>
  );
};

export default PageContent;
