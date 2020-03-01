import React, { useEffect } from 'react';
import './PageContent.scss';
import { useParams } from 'react-router-dom';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PageContentConnected';
import Loader from '../Loader';
import PageContentHeaderConnected from '../PageContentHeader';
import MealsListConnected from '../MealsList';

interface PageContentProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PageContent: React.FC<PageContentProps> = ({ loading, getContent, errorMessage }: PageContentProps) => {
  const { id: pageId } = useParams();

  useEffect(() => {
    const getContentAsync = async (): Promise<void> => {
      if (pageId && !isNaN(+pageId)) {
        await getContent(+pageId);
        window.scrollTo(0, 0);
      }
      return;
    };

    getContentAsync();
  }, [pageId, getContent]);

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
      {errorMessage && <div>{errorMessage}</div>}
      <MealsListConnected></MealsListConnected>
    </div>
  );
};

export default PageContent;
