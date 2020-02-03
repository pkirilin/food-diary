import React from 'react';
import './MealsControlPanel.scss';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './MealsControlPanelConnected';

interface MealsControlPanelProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const MealsControlPanel: React.FC<MealsControlPanelProps> = ({
  allMealTypes,
  setCollapsedForAllMeals,
}: MealsControlPanelProps) => {
  const handleExpandAllClick = (): void => {
    setCollapsedForAllMeals(false, allMealTypes);
  };

  const handleCollapseAllClick = (): void => {
    setCollapsedForAllMeals(true, allMealTypes);
  };

  return (
    <div className="meals-control-panel">
      <Icon type="expand" label="Expand all" onClick={handleExpandAllClick}></Icon>
      <Icon
        type="expand"
        label="Collapse all"
        svgStyle={{
          transform: 'rotate(180deg)',
        }}
        onClick={handleCollapseAllClick}
      ></Icon>
    </div>
  );
};

export default MealsControlPanel;
