import React, { useEffect } from 'react';
import './PageContent.scss';
import { PageContentStateToPropsMapResult, PageContentDispatchToPropsMapResult } from './PageContentConnected';
import PageContentHeaderConnected from '../PageContentHeader';
import MealsListConnected from '../MealsList';
import { useIdFromRoute } from '../../hooks';
import { Container, Preloader } from '../__ui__';

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
    return (
      <Container justify="center" textColor="middle-green">
        {notesForPageError}
      </Container>
    );
  }

  return (
    <div className="page-content">
      <div className="page-content__top-panel">
        <PageContentHeaderConnected></PageContentHeaderConnected>
      </div>
      <Preloader isVisible={areNotesForPageLoading} label={loadingMessage}>
        <MealsListConnected></MealsListConnected>
      </Preloader>
    </div>
  );
};

export default PageContent;
