import React from 'react';
import './PagesListItem.scss';
import { PageItem } from '../../models';
import { Link } from 'react-router-dom';
import Badge from '../Badge';
import { FDListItem, FDListItemLink } from '../List';
import { BadgesContainer } from '../ContainerBlocks';

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
      <BadgesContainer>
        <Badge label="12 notes" selected={selected}></Badge>
        <Badge label="1200 cal" selected={selected}></Badge>
      </BadgesContainer>
    </FDListItem>
  );
};

export default PagesListItem;
