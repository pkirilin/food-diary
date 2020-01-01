import React, { useEffect } from 'react';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesListConnected';

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
      <ul>
        {visiblePages.length > 0 ? visiblePages.map(p => <li key={p.id}>{p.date}</li>) : <div>No pages found</div>}
      </ul>
    );
  }

  return <div></div>;
};

export default PagesList;
