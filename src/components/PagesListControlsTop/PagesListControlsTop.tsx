import React from 'react';
import './PagesListControlsTop.scss';
import { SidebarControlPanel, SidebarControlPanelIcons } from '../SidebarBlocks';
import Icon from '../Icon';
import {
  PagesListControlsTopDispatchToPropsMapResult,
  PagesListControlsTopStateToPropsMapResult,
} from './PagesListControlsTopConnected';
import { useRouteMatch } from 'react-router-dom';
import { PagesListActionTypes, PagesOperationsActionTypes } from '../../action-types';
import { DropdownMenu, DropdownItem } from '../Controls';
import PagesExportFormConnected from '../PagesExportForm';

interface PagesListControlsTopProps
  extends PagesListControlsTopStateToPropsMapResult,
    PagesListControlsTopDispatchToPropsMapResult {}

const PagesListControlsTop: React.FC<PagesListControlsTopProps> = ({
  createDraftPage,
  pagesFilter,
  isPagesFilterChanged,
  clearPagesFilter,
  getPages,
  getNotesForPage,
  arePagesLoading,
  areNotesForMealLoading,
  areNotesForPageLoading,
  isPageOperationInProcess,
  isNoteOperationInProcess,
  openModal,
  importPages,
}: PagesListControlsTopProps) => {
  const match = useRouteMatch<{ [key: string]: string }>('/pages/:id');

  const isControlDisabled =
    arePagesLoading ||
    areNotesForMealLoading ||
    areNotesForPageLoading ||
    isPageOperationInProcess ||
    isNoteOperationInProcess;

  const isClearFilterDisabled = isControlDisabled || !isPagesFilterChanged;

  const handleAddIconClick = (): void => {
    createDraftPage({
      id: 0,
      date: '',
      countNotes: 0,
      countCalories: 0,
    });
  };

  const handleRefreshPagesListIconClick = async (): Promise<void> => {
    const { type: getPagesActionType } = await getPages(pagesFilter);

    if (getPagesActionType === PagesListActionTypes.Success) {
      const matchParams = match?.params;
      // Prevents notes request when no page selected
      if (matchParams && !isNaN(+matchParams['id'])) {
        await getNotesForPage({
          pageId: +matchParams['id'],
        });
      }
    }
  };

  const handleResetFilterIconClick = (): void => {
    clearPagesFilter();
  };

  const handleExportPagesClick = (): void => {
    openModal('Export pages', <PagesExportFormConnected></PagesExportFormConnected>, {
      width: '30%',
    });
  };

  const handleImportPagesFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const target = event.target;

    try {
      const file = event.target.files?.item(0);

      if (file) {
        const isImportConfirmed = window.confirm(
          'Pages import is going to be started. Import may update or overwrite existing data from file and may cause data loss. Continue?',
        );

        if (isImportConfirmed) {
          const { type } = await importPages(file);

          if (type === PagesOperationsActionTypes.ImportSuccess) {
            await getPages(pagesFilter);
            alert('Pages has been successfully imported from file');
          }
        }
      }
    } finally {
      // Cleaning file input value. Without this change handler will not be executed
      // if user tries to load file with the same name multiple times
      if (target) {
        target.value = '';
      }
    }
  };

  return (
    <SidebarControlPanel>
      <SidebarControlPanelIcons>
        <Icon type="add" onClick={handleAddIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="refresh" onClick={handleRefreshPagesListIconClick} disabled={isControlDisabled}></Icon>
        <Icon type="filter" disabled></Icon>
        <Icon type="close" disabled={isClearFilterDisabled} onClick={handleResetFilterIconClick}></Icon>
        <DropdownMenu
          toggler={<Icon type="three-dots" disabled={isControlDisabled}></Icon>}
          contentWidth={160}
          contentAlignment="right"
          disabled={isControlDisabled}
        >
          <DropdownItem onClick={handleExportPagesClick}>Export pages</DropdownItem>
          <DropdownItem>
            <label>
              <span>Import pages (JSON)</span>
              <input type="file" name="importFile" hidden onChange={handleImportPagesFileChange} />
            </label>
          </DropdownItem>
        </DropdownMenu>
      </SidebarControlPanelIcons>
    </SidebarControlPanel>
  );
};

export default PagesListControlsTop;
