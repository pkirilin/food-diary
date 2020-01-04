import React from 'react';
import './PagesListControlsBottom.scss';
import { IconSortDescending } from '../Icons';

const PagesListControlsBottom: React.FC = () => {
  return (
    <div className="fd-pages-list-controls-bottom">
      <IconSortDescending></IconSortDescending>
      <div className="fd-pages-list-controls-bottom__show-count">Show: All</div>
    </div>
  );
};

export default PagesListControlsBottom;
