import React from 'react';
import './CategoriesListItem.scss';
import { SidebarListItem, SidebarListItemLink } from '../SidebarBlocks';
import { BadgesContainer } from '../ContainerBlocks';
import Badge from '../Badge';
import { CategoryItem } from '../../models';

interface CategoriesListItemProps {
  data: CategoryItem;
}

const CategoriesListItem: React.FC<CategoriesListItemProps> = ({ data: category }: CategoriesListItemProps) => {
  const categoryProductsBadgeLabel = `${category.countProducts} ${
    category.countProducts === 1 ? 'product' : 'products'
  }`;

  return (
    <SidebarListItem>
      <SidebarListItemLink to={`/categories/${category.id}`} activeClassName="" selected={false}>
        <div>{category.name}</div>
        <BadgesContainer>
          <Badge label={categoryProductsBadgeLabel} selected={false}></Badge>
        </BadgesContainer>
      </SidebarListItemLink>
    </SidebarListItem>
  );
};

export default CategoriesListItem;
