import React from 'react';
import './MealsControlPanel.scss';
import Icon from '../Icon';
import { MealsControlPanelStateToProps, MealsControlPanelDispatchToPropsMapResult } from './MealsControlPanelConnected';
import { availableMealTypes } from '../../models';

interface MealsControlPanelProps extends MealsControlPanelStateToProps, MealsControlPanelDispatchToPropsMapResult {}

const MealsControlPanel: React.FC<MealsControlPanelProps> = ({
  setCollapsedForAllMeals,
  isPageContentLoading,
}: MealsControlPanelProps) => {
  const handleExpandAllClick = (): void => {
    setCollapsedForAllMeals(false, availableMealTypes);
  };

  const handleCollapseAllClick = (): void => {
    setCollapsedForAllMeals(true, availableMealTypes);
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
