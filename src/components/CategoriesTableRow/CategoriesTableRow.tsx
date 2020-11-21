import React from 'react';
import { useHover } from '../../hooks';
import { CategoryItem } from '../../models';
import { Icon } from '../__ui__';

type CategoriesTableRowProps = {
  category: CategoryItem;
};

export const CategoriesTableRow: React.FC<CategoriesTableRowProps> = ({ category }: CategoriesTableRowProps) => {
  const [areIconsVisible, showIcons, hideIcons] = useHover();

  return (
    <tr onMouseEnter={showIcons} onMouseLeave={hideIcons}>
      <td>{category.name}</td>
      {areIconsVisible ? (
        <React.Fragment>
          <td>
            <Icon type="edit" size="small" title="Edit category"></Icon>
          </td>
          <td>
            <Icon type="close" size="small" title="Delete category"></Icon>
          </td>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td></td>
          <td></td>
        </React.Fragment>
      )}
    </tr>
  );
};
