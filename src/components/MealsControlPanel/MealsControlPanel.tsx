import React from 'react';
import './MealsControlPanel.scss';
import Icon from '../Icon';

type MealsControlPanelProps = {};

const MealsControlPanel: React.FC<MealsControlPanelProps> = () => {
  return (
    <div className="meals-control-panel">
      <Icon type="expand" label="Expand all"></Icon>
      <Icon
        type="expand"
        label="Collapse all"
        svgStyle={{
          transform: 'rotate(180deg)',
        }}
      ></Icon>
    </div>
  );
};

export default MealsControlPanel;
