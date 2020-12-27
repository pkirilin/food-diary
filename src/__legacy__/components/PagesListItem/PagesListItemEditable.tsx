import React, { useState } from 'react';
import { SidebarListItem, SidebarListItemControls } from '../SidebarBlocks';
import { usePageValidation } from '../../hooks';
import { PagesOperationsActionTypes } from '../../action-types';
import { PageItem } from '../../models';
import {
  PagesListItemEditableStateToPropsMapResult,
  PagesListItemEditableDispatchToPropsMapResult,
} from './PagesListItemEditableConnected';
import { Icon, Input } from '../__ui__';

interface PagesListItemEditableProps
  extends PagesListItemEditableStateToPropsMapResult,
    PagesListItemEditableDispatchToPropsMapResult {
  page: PageItem;
}

const PagesListItemEditable: React.FC<PagesListItemEditableProps> = ({
  page,
  pageOperationStatus,
  mealOperationStatuses,
  notesForPageFetchState,
  notesForMealFetchStates,
  pagesFilter,
  editPage,
  getPages,
  setEditableForPages,
}: PagesListItemEditableProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);
  const [isPageDateValid] = usePageValidation(selectedDate);

  const { performing: isPageOperationInProcess } = pageOperationStatus;
  const { loading: areNotesForPageLoading } = notesForPageFetchState;

  const isNoteOperationInProcess = mealOperationStatuses.some(s => s.performing);
  const areNotesForMealLoading = notesForMealFetchStates.some(s => s.loading);

  const isAnySideEffectHappening =
    isPageOperationInProcess || isNoteOperationInProcess || areNotesForMealLoading || areNotesForPageLoading;
  const isConfirmEditDisabled = isAnySideEffectHappening || !isPageDateValid;

  const handleSelectedDateChange = (event: React.ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target) {
      setSelectedDate(target.value);
    }
  };

  const handleConfirmEditPageIconClick = async (): Promise<void> => {
    const editPageAction = await editPage({
      id: page.id,
      page: {
        date: selectedDate,
      },
    });

    if (editPageAction.type === PagesOperationsActionTypes.EditSuccess) {
      setEditableForPages([page.id], false);
      await getPages(pagesFilter);
    }
  };

  const handleCancelEditPageIconClick = (): void => {
    setEditableForPages([page.id], false);
    setSelectedDate(page.date);
  };

  return (
    <SidebarListItem editable>
      <Input
        type="date"
        placeholder="Pick date"
        value={selectedDate}
        onChange={handleSelectedDateChange}
        disabled={isAnySideEffectHappening}
      ></Input>
      <SidebarListItemControls>
        <Icon
          type="check"
          size="small"
          onClick={handleConfirmEditPageIconClick}
          disabled={isConfirmEditDisabled}
        ></Icon>
        <Icon
          type="close"
          size="small"
          onClick={handleCancelEditPageIconClick}
          disabled={isAnySideEffectHappening}
        ></Icon>
      </SidebarListItemControls>
    </SidebarListItem>
  );
};

export default PagesListItemEditable;
