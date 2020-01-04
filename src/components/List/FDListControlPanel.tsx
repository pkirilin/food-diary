import React from 'react';
import './FDListControlPanel.scss';

const FDListControlPanel: React.FC = props => {
  return <div className="fd-list-control-panel">{props?.children}</div>;
};

export default FDListControlPanel;
