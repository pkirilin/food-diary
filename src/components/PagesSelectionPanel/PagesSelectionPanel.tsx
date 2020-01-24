import React from 'react';
import './PagesSelectionPanel.scss';
import { SidebarSelectionPanel, SidebarSelectionPanelOptions } from '../SidebarBlocks';
import { Checkbox } from '../Controls';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesSelectionPanelConnected';

interface PagesSelectionPanelProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesSelectionPanel: React.FC<PagesSelectionPanelProps> = ({
  visiblePagesCount,
  selectedPagesCount,
  setSelectedForAllPages,
}: PagesSelectionPanelProps) => {
  const selectAllChecked = visiblePagesCount === selectedPagesCount;

  const handleCheck = (): void => {
    setSelectedForAllPages(!selectAllChecked);
  };

  return (
    <SidebarSelectionPanel>
      <Checkbox checked={selectAllChecked} onCheck={handleCheck} label="Select all"></Checkbox>
      {selectedPagesCount > 0 ? (
        <SidebarSelectionPanelOptions>
          <div>Selected: {selectedPagesCount}</div>
          <Icon type="three-dots"></Icon>
        </SidebarSelectionPanelOptions>
      ) : (
        <SidebarSelectionPanelOptions withoutSelection>No pages selected</SidebarSelectionPanelOptions>
      )}
    </SidebarSelectionPanel>
  );
};

export default PagesSelectionPanel;
