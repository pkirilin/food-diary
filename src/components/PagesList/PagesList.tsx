import React, { useEffect } from 'react';
import './PagesList.scss';
import { PagesListStateToPropsMapResult, PagesListDispatchToPropsMapResult } from './PagesListConnected';
import PagesListItemConnected from '../PagesListItem';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import Loader from '../Loader';

interface PagesListProps extends PagesListStateToPropsMapResult, PagesListDispatchToPropsMapResult {}

const PagesList: React.FC<PagesListProps> = ({
  pageItems,
  pageItemsFetchState,
  pagesFilter,
  getPages,
}: PagesListProps) => {
  useEffect(() => {
    getPages(pagesFilter);
  }, [getPages, pagesFilter]);

  const { loading, loaded, error: errorMessage, loadingMessage } = pageItemsFetchState;

  if (loading) {
    return (
      <SidebarListPlaceholder>
        <Loader label={loadingMessage}></Loader>
      </SidebarListPlaceholder>
    );
  }

  if (!loaded) {
    return <SidebarListPlaceholder type="info">{errorMessage}</SidebarListPlaceholder>;
  }

  return pageItems.length > 0 ? (
    <SidebarList>
      {pageItems.map(page => (
        <PagesListItemConnected key={page.id} page={page}></PagesListItemConnected>
      ))}
    </SidebarList>
  ) : (
    <SidebarListPlaceholder type="info">No pages found</SidebarListPlaceholder>
  );
};

export default PagesList;
