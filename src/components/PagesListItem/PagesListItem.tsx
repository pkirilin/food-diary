import React, { useState } from 'react';
import './PagesListItem.scss';
import Badge from '../Badge';
import { SidebarListItem, SidebarListItemLink, SidebarListItemControls } from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import { Input } from '../Controls';
import Icon from '../Icon';
import { DispatchToPropsMapResult, StateToPropsMapResult } from './PagesListItemConnected';
import { PageItem } from '../../models';

interface PagesListItemProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  data: PageItem;
  selected?: boolean;
}

const PagesListItem: React.FC<PagesListItemProps> = ({
  data: page,
  selected = false,
  createPage,
  deleteDraftPage,
  getPages,
  pagesFilter,
  editablePagesIds,
}: PagesListItemProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);

  const handleSelectedDateChange = (event: React.ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target) {
      setSelectedDate(target.value);
    }
  };

  const handleConfirmEditPageIconClick = async (): Promise<void> => {
    await createPage({ id: page.id, date: selectedDate });
    deleteDraftPage(page.id);
    await getPages(pagesFilter);
  };

  const handleCancelEditPageIconClick = (): void => {
    deleteDraftPage(page.id);
  };

  const notesBadgeLabel = `${page.countNotes} ${page.countNotes === 1 ? 'note' : 'notes'}`;
  const caloriesBadgeLabel = `${page.countCalories} cal`;

  return {
    ...(editablePagesIds.some(id => page.id === id) ? (
      <SidebarListItem selected={selected} editable>
        <Input type="date" placeholder="Pick date" value={selectedDate} onChange={handleSelectedDateChange}></Input>
        <SidebarListItemControls>
          <Icon type="check" size="small" onClick={handleConfirmEditPageIconClick}></Icon>
          <Icon type="close" size="small" onClick={handleCancelEditPageIconClick}></Icon>
        </SidebarListItemControls>
      </SidebarListItem>
    ) : (
      <SidebarListItem selected={selected}>
        <SidebarListItemLink
          to={`/pages/${page.id}`}
          activeClassName="sidebar__list__item__link_active"
          selected={selected}
        >
          <div>{page.date}</div>
          <BadgesContainer>
            <Badge label={notesBadgeLabel} selected={selected}></Badge>
            <Badge label={caloriesBadgeLabel} selected={selected}></Badge>
          </BadgesContainer>
        </SidebarListItemLink>
      </SidebarListItem>
    )),
  };
};

export default PagesListItem;
