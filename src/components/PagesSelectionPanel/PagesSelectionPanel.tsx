import React from 'react';
import './PagesSelectionPanel.scss';
import { SidebarSelectionPanel, SidebarSelectionPanelOptions } from '../SidebarBlocks';
import { Checkbox } from '../Controls';
import Icon from '../Icon';

type PagesSelectionPanelProps = {};

const PagesSelectionPanel: React.FC<PagesSelectionPanelProps> = () => {
  const selectAllChecked = false;
  const checkedPagesCount = 0;

  const handleCheck = (): void => {
    return;
  };

  return (
    <SidebarSelectionPanel>
      <Checkbox checked={selectAllChecked} onCheck={handleCheck} label="Select all"></Checkbox>
      {checkedPagesCount > 0 ? (
        <SidebarSelectionPanelOptions>
          <div>Selected: {checkedPagesCount}</div>
          <Icon type="three-dots"></Icon>
        </SidebarSelectionPanelOptions>
      ) : (
        <SidebarSelectionPanelOptions withoutSelection>No pages selected</SidebarSelectionPanelOptions>
      )}
    </SidebarSelectionPanel>
  );
};

export default PagesSelectionPanel;
