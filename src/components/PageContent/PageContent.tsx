import React, { useEffect } from 'react';
import './PageContent.scss';
import { useParams } from 'react-router-dom';
import { PageContentStateToPropsMapResult, PageContentDispatchToPropsMapResult } from './PageContentConnected';
import Loader from '../Loader';
import PageContentHeaderConnected from '../PageContentHeader';
import MealsList from '../MealsList';
import { SectionPlaceholder } from '../ContainerBlocks';

interface PageContentProps extends PageContentStateToPropsMapResult, PageContentDispatchToPropsMapResult {}

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

  const { loading: areNotesForPageLoading, error: notesForPageError } = notesForPageFetchState;

  if (notesForPageError !== undefined) {
    return <SectionPlaceholder>{notesForPageError}</SectionPlaceholder>;
  }

  return (
    <div className="page-content">
      <div className="page-content__top-panel">
        <PageContentHeaderConnected></PageContentHeaderConnected>
      </div>
      {areNotesForPageLoading && (
        <div className="page-content__preloader">
          <Loader label="Loading page content"></Loader>
        </div>
      )}
      <MealsList></MealsList>
    </div>
  );
};

export default PageContent;
