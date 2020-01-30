import React, { useEffect } from 'react';
import './PageContent.scss';
import { useParams } from 'react-router-dom';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PageContentConnected';
import Loader from '../Loader';

interface PageContentProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PageContent: React.FC<PageContentProps> = ({
  loading,
  loaded,
  pageDate,
  getContent,
  errorMessage,
}: PageContentProps) => {
  const { id: pageId } = useParams();

  useEffect(() => {
    if (pageId && !isNaN(+pageId)) {
      getContent(+pageId);
    }
  }, [pageId, getContent]);

  if (loading) {
    return <Loader label="Loading page content"></Loader>;
  }

  if (loaded) {
    return <div>{pageDate}</div>;
  }

  return <div>{errorMessage}</div>;
};

export default PageContent;
