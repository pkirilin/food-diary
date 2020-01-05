import React from 'react';
import './PagesListItem.scss';
import { PageItem } from '../../models';
import Badge from '../Badge';
import { SidebarListItem, SidebarListItemLink } from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';

interface PagesListItemProps {
  key: string | number;
  data: PageItem;
  selected?: boolean;
}

const PagesListItem: React.FC<PagesListItemProps> = ({ data: page, selected = false }: PagesListItemProps) => {
  return (
    <SidebarListItem selected={selected}>
      <SidebarListItemLink to="/" selected={selected}>
        {page.date}
      </SidebarListItemLink>
      <BadgesContainer>
        <Badge label="12 notes" selected={selected}></Badge>
        <Badge label="1200 cal" selected={selected}></Badge>
      </BadgesContainer>
    </SidebarListItem>
  );
};

export default PagesListItem;
