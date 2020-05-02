import React, { useState } from 'react';
import { SidebarListItem, SidebarListItemControls } from '../SidebarBlocks';
import { Input } from '../Controls';
import Icon from '../Icon';
import { usePageValidation } from '../../hooks';
import { useHistory } from 'react-router-dom';
import { PagesOperationsActionTypes, PagesListActionTypes, CreatePageSuccessAction } from '../../action-types';
import { PageItem } from '../../models';
import {
  PagesListItemEditableStateToPropsMapResult,
  PagesListItemEditableDispatchToPropsMapResult,
} from './PagesListItemEditableConnected';

interface PagesListItemEditableProps
  extends PagesListItemEditableStateToPropsMapResult,
    PagesListItemEditableDispatchToPropsMapResult {
  page: PageItem;
  isDraft?: boolean;
}

const PagesListItemEditable: React.FC<PagesListItemEditableProps> = ({
  page,
  isDraft = false,
  pageOperationStatus,
  mealOperationStatuses,
  notesForPageFetchState,
  notesForMealFetchStates,
  pagesFilter,
  createPage,
  editPage,
  deleteDraftPage,
  getPages,
  setEditableForPages,
}: PagesListItemEditableProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);
  const [isPageDateValid] = usePageValidation(selectedDate);
  const history = useHistory();

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
    if (isDraft) {
      const createPageAction = await createPage({
        date: selectedDate,
      });

      if (createPageAction.type === PagesOperationsActionTypes.CreateSuccess) {
        deleteDraftPage(page.id);
        const { type: getPagesActionType } = await getPages(pagesFilter);

        if (getPagesActionType === PagesListActionTypes.Success) {
          const { createdPageId } = createPageAction as CreatePageSuccessAction;
          history.push(`/pages/${createdPageId}`);
        }
      }
    } else {
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
    }
  };

  const handleCancelEditPageIconClick = (): void => {
    if (isDraft) {
      deleteDraftPage(page.id);
    } else {
      setEditableForPages([page.id], false);
      setSelectedDate(page.date);
    }
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
