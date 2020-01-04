import React from 'react';
import './FDListControlPanelSelection.scss';
import { IconMore } from '../Icons';

const FDListControlPanelSelection: React.FC = () => {
  return (
    <div className="fd-list-control-panel__selection">
      <div>Selected</div>
      <IconMore></IconMore>
    </div>
  );
};

export default FDListControlPanelSelection;
