import React, { useEffect } from 'react';
import './PagesList.scss';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesListConnected';
import PagesListItemConnected from '../PagesListItem';
import { FDList } from '../List';

interface PagesListProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesList: React.FC<PagesListProps> = ({ visiblePages, loading, loaded, getPages }: PagesListProps) => {
  useEffect(() => {
    getPages();
  }, [getPages]);

  if (loading) {
    return <div>Loading</div>;
  }

  if (loaded) {
    return (
      <FDList>
        {visiblePages.length > 0 ? (
          visiblePages.map(p => <PagesListItemConnected key={p.id} data={p}></PagesListItemConnected>)
        ) : (
          <div>No pages found</div>
        )}
      </FDList>
    );
  }

  return <div></div>;
};

export default PagesList;
