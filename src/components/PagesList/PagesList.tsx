import React, { useEffect } from 'react';
import './PagesList.scss';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesListConnected';
import PagesListItemConnected from '../PagesListItem';
import { SidebarList, SidebarListPlaceholder } from '../SidebarBlocks';
import Loader from '../Loader';

interface PagesListProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesList: React.FC<PagesListProps> = ({
  visiblePages,
  loading,
  loaded,
  getPages,
  errorMessage,
  pagesFilter,
}: PagesListProps) => {
  useEffect(() => {
    getPages(pagesFilter);
  }, [getPages, pagesFilter]);

  if (loading) {
    return (
      <SidebarListPlaceholder>
        <Loader label="Loading pages"></Loader>
      </SidebarListPlaceholder>
    );
  }

  if (loaded) {
    return visiblePages.length > 0 ? (
      <SidebarList>
        {visiblePages.map(p => (
          <PagesListItemConnected key={p.id} data={p}></PagesListItemConnected>
        ))}
      </SidebarList>
    ) : (
      <SidebarListPlaceholder type="info">No pages found</SidebarListPlaceholder>
    );
  }

  return <SidebarListPlaceholder type="info">{errorMessage}</SidebarListPlaceholder>;
};

export default PagesList;
