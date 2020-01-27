import React, { useState } from 'react';
import './PagesListItem.scss';
import Badge from '../Badge';
import { SidebarListItem, SidebarListItemLink, SidebarListItemControls } from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import { Input, Checkbox } from '../Controls';
import Icon from '../Icon';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListItemConnected';
import { PageItem } from '../../models';
import SidebarListItemCheckbox from '../SidebarBlocks/SidebarListItemCheckbox';

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
  isOperationInProcess,
}: PagesListItemProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);

  const isEditable = editablePagesIds.some(id => page.id === id);
  const isSelected = selectedPagesIds.some(id => page.id === id);

  const handleSelectedDateChange = (event: React.ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target) {
      setSelectedDate(target.value);
    }
  };

  const handleConfirmEditPageIconClick = async (): Promise<void> => {
    if (page.id < 1) {
      // This is a draft page for create
      await createPage({ id: page.id, date: selectedDate });
      deleteDraftPage(page.id);
    } else {
      // This is existing page for edit
      await editPage(page);
      setEditableForPages([page.id], false);
    }

    await getPages(pagesFilter);
  };

  const handleCancelEditPageIconClick = (): void => {
    if (page.id < 1) {
      // This is a draft page: cancel = delete draft
      deleteDraftPage(page.id);
    } else {
      // This is existing page: cancel = make page not editable
      setEditableForPages([page.id], false);
    }
  };

  const handlePageCheck = (): void => {
    setSelectedForPage(!isSelected, page.id);
  };

  const notesBadgeLabel = `${page.countNotes} ${page.countNotes === 1 ? 'note' : 'notes'}`;
  const caloriesBadgeLabel = `${page.countCalories} cal`;

  const activeLinkClassName = isSelected ? 'sidebar-list-item-link_active-selected' : 'sidebar-list-item-link_active';

  return {
    ...(isEditable ? (
      <SidebarListItem editable>
        <Input
          type="date"
          placeholder="Pick date"
          value={selectedDate}
          onChange={handleSelectedDateChange}
          disabled={isOperationInProcess}
        ></Input>
        <SidebarListItemControls>
          <Icon
            type="check"
            size="small"
            onClick={handleConfirmEditPageIconClick}
            disabled={isOperationInProcess}
          ></Icon>
          <Icon
            type="close"
            size="small"
            onClick={handleCancelEditPageIconClick}
            disabled={isOperationInProcess}
          ></Icon>
        </SidebarListItemControls>
      </SidebarListItem>
    ) : (
      <SidebarListItem selected={isSelected}>
        <SidebarListItemLink to={`/pages/${page.id}`} activeClassName={activeLinkClassName} selected={isSelected}>
          <div>{page.date}</div>
          <BadgesContainer>
            <Badge label={notesBadgeLabel} selected={isSelected}></Badge>
            <Badge label={caloriesBadgeLabel} selected={isSelected}></Badge>
          </BadgesContainer>
        </SidebarListItemLink>
        <SidebarListItemCheckbox>
          <Checkbox checked={isSelected} onCheck={handlePageCheck}></Checkbox>
        </SidebarListItemCheckbox>
      </SidebarListItem>
    )),
  };
};

export default PagesListItem;
