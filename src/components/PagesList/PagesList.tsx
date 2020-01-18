import React, { useEffect } from 'react';
import './PagesList.scss';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesListConnected';
import PagesListItemConnected from '../PagesListItem';
import { SidebarList } from '../SidebarBlocks';

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
    return <div>Loading</div>;
  }

  if (loaded) {
    return (
      <SidebarList>
        {visiblePages.length > 0 ? (
          visiblePages.map(p => <PagesListItemConnected key={p.id} data={p}></PagesListItemConnected>)
        ) : (
          <div>No pages found</div>
        )}
      </SidebarList>
    );
  }

  return <div>{errorMessage}</div>;
};

export default PagesList;
