import React from 'react';
import './CategoriesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import Icon from '../Icon';

type CategoriesListControlsTopProps = {};

const CategoriesListControlsTop: React.FC<CategoriesListControlsTopProps> = () => {
  const isControlDisabled = false;

  const handleAddIconClick = (): void => {
    return;
  };

  const handleRefreshIconClick = (): void => {
    return;
  };

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <Icon type="add" onClick={handleAddIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="refresh" onClick={handleRefreshIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="filter" disabled={true}></Icon>
        <Icon type="close" disabled={true}></Icon>
      </SidebarControlPanelIcons>
    </SidebarControlPanel>
  );
};

export default CategoriesListControlsTop;
