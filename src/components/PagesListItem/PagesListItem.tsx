import React, { useState } from 'react';
import './PagesListItem.scss';
import Badge from '../Badge';
import {
  SidebarListItem,
  SidebarListItemLink,
  SidebarListItemControls,
  useActiveLinkClassName,
} from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import { Input, Checkbox } from '../Controls';
import Icon from '../Icon';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListItemConnected';
import { PageItem } from '../../models';
import { PagesOperationsActionTypes } from '../../action-types';
import { getFormattedDate } from '../../utils/date-utils';

interface PagesListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: PageItem;
}

const PagesListItem: React.FC<PagesListItemProps> = ({
  data: page,
  createPage,
  editPage,
  deleteDraftPage,
  getPages,
  pagesFilter,
  editablePagesIds,
  selectedPagesIds,
  setSelectedForPage,
  setEditableForPages,
  isPageOperationInProcess,
  isNoteOperationInProcess,
  areNotesForPageLoading,
  areNotesForMealLoading,
}: PagesListItemProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);

  const isEditable = editablePagesIds.some(id => page.id === id);
  const isSelected = selectedPagesIds.some(id => page.id === id);
  const isAnySideEffectHappening =
    isPageOperationInProcess || isNoteOperationInProcess || areNotesForMealLoading || areNotesForPageLoading;

  const handleSelectedDateChange = (event: React.ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target) {
      setSelectedDate(target.value);
    }
  };

  const handleConfirmEditPageIconClick = async (): Promise<void> => {
    if (page.id < 1) {
      // This is a draft page for create
      const createPageAction = await createPage({
        date: selectedDate,
      });

      if (createPageAction.type === PagesOperationsActionTypes.CreateSuccess) {
        deleteDraftPage(page.id);
        await getPages(pagesFilter);
      }
    } else {
      // This is existing page for edit
      const editPageAction = await editPage({
        id: page.id,
        date: selectedDate,
      });

      if (editPageAction.type === PagesOperationsActionTypes.EditSuccess) {
        setEditableForPages([page.id], false);
        await getPages(pagesFilter);
      }
    }
  };

  const handleCancelEditPageIconClick = (): void => {
    if (page.id < 1) {
      // This is a draft page: cancel = delete draft
      deleteDraftPage(page.id);
    } else {
      // This is existing page: cancel = make page not editable
      setEditableForPages([page.id], false);
      setSelectedDate(page.date);
    }
  };

  const handlePageCheck = (): void => {
    setSelectedForPage(!isSelected, page.id);
  };

  const notesBadgeLabel = `${page.countNotes} ${page.countNotes === 1 ? 'note' : 'notes'}`;
  const caloriesBadgeLabel = `${page.countCalories} cal`;

  const activeLinkClassName = useActiveLinkClassName(isSelected);

  return (
    <React.Fragment>
      {isEditable ? (
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
              disabled={isAnySideEffectHappening}
            ></Icon>
            <Icon
              type="close"
              size="small"
              onClick={handleCancelEditPageIconClick}
              disabled={isAnySideEffectHappening}
            ></Icon>
          </SidebarListItemControls>
        </SidebarListItem>
      ) : (
        <SidebarListItem selected={isSelected}>
          <SidebarListItemLink to={`/pages/${page.id}`} activeClassName={activeLinkClassName} selected={isSelected}>
            <div>{getFormattedDate(page.date)}</div>
            <BadgesContainer>
              <Badge label={notesBadgeLabel} selected={isSelected}></Badge>
              <Badge label={caloriesBadgeLabel} selected={isSelected}></Badge>
            </BadgesContainer>
          </SidebarListItemLink>
          <SidebarListItemControls>
            <Checkbox checked={isSelected} onCheck={handlePageCheck}></Checkbox>
          </SidebarListItemControls>
        </SidebarListItem>
      )}
    </React.Fragment>
  );
};

export default PagesListItem;
