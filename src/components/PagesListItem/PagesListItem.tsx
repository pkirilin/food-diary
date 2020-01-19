import React, { useState } from 'react';
import './PagesListItem.scss';
import Badge from '../Badge';
import { SidebarListItem, SidebarListItemLink, SidebarListItemControls } from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import { PageItemState } from '../../store';
import { Input } from '../Controls';
import Icon from '../Icon';

interface PagesListItemProps {
  data: PageItemState;
  selected?: boolean;
}

const PagesListItem: React.FC<PagesListItemProps> = ({ data: page, selected = false }: PagesListItemProps) => {
  const [selectedDate, setSelectedDate] = useState(page.date);

  const handleSelectedDateChange = (event: React.ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    if (target) {
      setSelectedDate(target.value);
    }
  };

  const notesBadgeLabel = `${page.countNotes} ${page.countNotes === 1 ? 'note' : 'notes'}`;
  const caloriesBadgeLabel = `${page.countCalories} cal`;

  return {
    ...(page.editable ? (
      <SidebarListItem selected={selected} editable>
        <Input type="date" placeholder="Pick date" value={selectedDate} onChange={handleSelectedDateChange}></Input>
        <SidebarListItemControls>
          <Icon type="check" size="small"></Icon>
          <Icon type="close" size="small"></Icon>
        </SidebarListItemControls>
      </SidebarListItem>
    ) : (
      <SidebarListItem selected={selected}>
        <SidebarListItemLink to="/" selected={selected}>
          {page.date}
        </SidebarListItemLink>
        <BadgesContainer>
          <Badge label={notesBadgeLabel} selected={selected}></Badge>
          <Badge label={caloriesBadgeLabel} selected={selected}></Badge>
        </BadgesContainer>
      </SidebarListItem>
    )),
  };
};

export default PagesListItem;
