import React from 'react';
import './MealsControlPanel.scss';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './MealsControlPanelConnected';

interface MealsControlPanelProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const MealsControlPanel: React.FC<MealsControlPanelProps> = ({
  allMealTypes,
  setCollapsedForAllMeals,
  isPageContentLoading,
}: MealsControlPanelProps) => {
  const handleExpandAllClick = (): void => {
    setCollapsedForAllMeals(false, allMealTypes);
  };

  const handleCollapseAllClick = (): void => {
    setCollapsedForAllMeals(true, allMealTypes);
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
