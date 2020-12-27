import React from 'react';
import './MealsControlPanel.scss';
import { MealsControlPanelStateToProps, MealsControlPanelDispatchToPropsMapResult } from './MealsControlPanelConnected';
import { Icon } from '../__ui__';

interface MealsControlPanelProps extends MealsControlPanelStateToProps, MealsControlPanelDispatchToPropsMapResult {}

const MealsControlPanel: React.FC<MealsControlPanelProps> = ({
  expandAllMeals,
  collapseAllMeals,
  isPageContentLoading,
}: MealsControlPanelProps) => {
  const handleExpandAllClick = (): void => {
    expandAllMeals();
  };

  const handleCollapseAllClick = (): void => {
    collapseAllMeals();
  };

  return (
    <div className="meals-control-panel">
      <Icon type="expand" label="Expand all" onClick={handleExpandAllClick} disabled={isPageContentLoading}></Icon>
      <Icon
        type="expand"
        label="Collapse all"
        svgStyle={{
          transform: 'rotate(180deg)',
        }}
        onClick={handleCollapseAllClick}
        disabled={isPageContentLoading}
      ></Icon>
    </div>
  );
};

export default MealsControlPanel;
