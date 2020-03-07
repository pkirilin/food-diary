import React from 'react';
import './PagesSelectionPanel.scss';
import { SidebarSelectionPanel, SidebarSelectionPanelOptions } from '../SidebarBlocks';
import { Checkbox, DropdownMenu, DropdownItem } from '../Controls';
import Icon from '../Icon';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './PagesSelectionPanelConnected';
import Loader from '../Loader';
import { PagesOperationsActionTypes } from '../../action-types';

interface PagesSelectionPanelProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const PagesSelectionPanel: React.FC<PagesSelectionPanelProps> = ({
  visiblePagesIds,
  selectedPagesIds,
  setSelectedForAllPages,
  operationMessage,
  deletePages,
  getPages,
  pagesFilter,
  setEditableForPages,
  isPageOperationInProcess,
  isNoteOperationInProcess,
  areNotesForPageFetching,
  areNotesForMealFetching,
}: PagesSelectionPanelProps) => {
  const isAnySideEffectHappening =
    isPageOperationInProcess || isNoteOperationInProcess || areNotesForPageFetching || areNotesForMealFetching;
  const isSelectAllChecked = visiblePagesIds.every(id => selectedPagesIds.includes(id));
  const selectedPagesCount = selectedPagesIds.length;

  const handleSelectAllClick = (): void => {
    setSelectedForAllPages(!isSelectAllChecked);
  };

  const handleEditOptionClick = (): void => {
    setEditableForPages(selectedPagesIds, true);
  };

  const handleDeleteOptionClick = async (): Promise<void> => {
    // TODO: create component for modal
    const isDeleteConfirmed = window.confirm('Do you want to delete all selected pages?');
    if (isDeleteConfirmed) {
      const deletePagesAction = await deletePages(selectedPagesIds);
      if (deletePagesAction.type === PagesOperationsActionTypes.DeleteSuccess) {
        await getPages(pagesFilter);
      }
    }
  };

  const selectionOptionsToggler = <Icon type="three-dots" disabled={isAnySideEffectHappening}></Icon>;

  return (
    <SidebarSelectionPanel>
      <Checkbox checked={isSelectAllChecked} onCheck={handleSelectAllClick} label="Select all"></Checkbox>
      {selectedPagesCount > 0 ? (
        <SidebarSelectionPanelOptions>
          {isPageOperationInProcess ? (
            <Loader label={operationMessage} size="small"></Loader>
          ) : (
            <React.Fragment>
              <div>Selected: {selectedPagesCount}</div>
              <DropdownMenu
                toggler={selectionOptionsToggler}
                contentWidth={150}
                contentAlignment="right"
                disabled={isAnySideEffectHappening}
              >
                <DropdownItem onClick={handleEditOptionClick}>Edit</DropdownItem>
                <DropdownItem onClick={handleDeleteOptionClick}>Delete</DropdownItem>
              </DropdownMenu>
            </React.Fragment>
          )}
        </SidebarSelectionPanelOptions>
      ) : (
        <SidebarSelectionPanelOptions withoutSelection>
          {isPageOperationInProcess ? <Loader label={operationMessage} size="small"></Loader> : 'No pages selected'}
        </SidebarSelectionPanelOptions>
      )}
    </SidebarSelectionPanel>
  );
};

export default PagesSelectionPanel;
