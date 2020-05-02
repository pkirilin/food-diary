import React, { useEffect } from 'react';
import './PagesList.scss';
import { PagesListStateToPropsMapResult, PagesListDispatchToPropsMapResult } from './PagesListConnected';
import PagesListItemConnected from '../PagesListItem';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import Loader from '../Loader';
import PagesListItemEditableConnected from '../PagesListItem/PagesListItemEditableConnected';

interface PagesListProps extends PagesListStateToPropsMapResult, PagesListDispatchToPropsMapResult {}

const PagesList: React.FC<PagesListProps> = ({
  pageItems,
  pageItemsFetchState,
  pageDraftItems,
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

  return pageItems.length + pageDraftItems.length > 0 ? (
    <SidebarList>
      {pageDraftItems.map(page => (
        <PagesListItemEditableConnected key={page.id} page={page} isDraft={true}></PagesListItemEditableConnected>
      ))}
      {pageItems.map(page => (
        <PagesListItemConnected key={page.id} page={page}></PagesListItemConnected>
      ))}
    </SidebarList>
  ) : (
    <SidebarListPlaceholder type="info">No pages found</SidebarListPlaceholder>
  );
};

export default PagesList;
