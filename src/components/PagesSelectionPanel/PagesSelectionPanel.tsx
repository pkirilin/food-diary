import React from 'react';
import './PagesSelectionPanel.scss';
import { SidebarSelectionPanel, SidebarSelectionPanelOptions } from '../SidebarBlocks';
import { Checkbox, DropdownMenu, DropdownItem } from '../Controls';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesSelectionPanelConnected';

interface PagesSelectionPanelProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesSelectionPanel: React.FC<PagesSelectionPanelProps> = ({
  visiblePagesCount,
  selectedPagesCount,
  setSelectedForAllPages,
}: PagesSelectionPanelProps) => {
  const selectAllChecked = visiblePagesCount === selectedPagesCount;

  const handleSelectAllClick = (): void => {
    setSelectedForAllPages(!selectAllChecked);
  };

  const handleEditOptionClick = (): void => {
    return;
  };

  const handleDeleteOptionClick = (): void => {
    // TODO: modal
    const isDeleteConfirmed = window.confirm('Do you want to delete all selected pages?');
    if (isDeleteConfirmed) {
    }
  };

  const selectionOptionsToggler = <Icon type="three-dots"></Icon>;

  return (
    <SidebarSelectionPanel>
      <Checkbox checked={selectAllChecked} onCheck={handleSelectAllClick} label="Select all"></Checkbox>
      {selectedPagesCount > 0 ? (
        <SidebarSelectionPanelOptions>
          <div>Selected: {selectedPagesCount}</div>
          <DropdownMenu toggler={selectionOptionsToggler} contentWidth={150}>
            <DropdownItem onClick={handleEditOptionClick}>Edit</DropdownItem>
            <DropdownItem onClick={handleDeleteOptionClick}>Delete</DropdownItem>
          </DropdownMenu>
        </SidebarSelectionPanelOptions>
      ) : (
        <SidebarSelectionPanelOptions withoutSelection>No pages selected</SidebarSelectionPanelOptions>
      )}
    </SidebarSelectionPanel>
  );
};

export default PagesSelectionPanel;
