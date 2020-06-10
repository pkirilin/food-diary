import React, { useEffect } from 'react';
import './PageContent.scss';
import { PageContentStateToPropsMapResult, PageContentDispatchToPropsMapResult } from './PageContentConnected';
import PageContentHeaderConnected from '../PageContentHeader';
import MealsList from '../MealsList';
import { SectionPlaceholder } from '../ContainerBlocks';
import { useIdFromRoute } from '../../hooks';
import { Loader } from '../__ui__';

interface PageContentProps extends PageContentStateToPropsMapResult, PageContentDispatchToPropsMapResult {}

const PageContent: React.FC<PageContentProps> = ({ notesForPageFetchState, getNotesForPage }: PageContentProps) => {
  const pageId = useIdFromRoute();

  useEffect(() => {
    const getContentAsync = async (): Promise<void> => {
      if (pageId) {
        await getNotesForPage({ pageId });
        window.scrollTo(0, 0);
      }
    };

    getContentAsync();
  }, [pageId, getNotesForPage]);

  const { loading: areNotesForPageLoading, error: notesForPageError, loadingMessage } = notesForPageFetchState;

  if (notesForPageError) {
    return <SectionPlaceholder>{notesForPageError}</SectionPlaceholder>;
  }

  return (
    <div className="page-content">
      <div className="page-content__top-panel">
        <PageContentHeaderConnected></PageContentHeaderConnected>
      </div>
      {areNotesForPageLoading && (
        <div className="page-content__preloader">
          <Loader label={loadingMessage}></Loader>
        </div>
      )}
      <MealsList></MealsList>
    </div>
  );
};

export default PageContent;
