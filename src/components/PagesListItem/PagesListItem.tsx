import React from 'react';
import './PagesListItem.scss';
import { PageItem } from '../../models';
import { Link } from 'react-router-dom';
import Badge from '../Badge';
import { FDListItem, FDListItemLink, FDListItemBadges } from '../List';

interface PagesListItemProps {
  key: string | number;
  data: PageItem;
  selected?: boolean;
}

const PagesListItem: React.FC<PagesListItemProps> = ({ data: page, selected = false }: PagesListItemProps) => {
  return (
    <FDListItem selected={selected}>
      <FDListItemLink selected={selected}>
        <Link to="/">{page.date}</Link>
      </FDListItemLink>
      <FDListItemBadges>
        <Badge label="12 notes" selected={selected}></Badge>
        <Badge label="1200 cal" selected={selected}></Badge>
      </FDListItemBadges>
    </FDListItem>
  );
};

export default PagesListItem;
