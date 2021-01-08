import React from 'react';
import { Divider, List } from '@material-ui/core';
import { CategoryItem } from '../models';
import CategoriesListItem from './CategoriesListItem';

const categoryItems: CategoryItem[] = [
  {
    id: 1,
    name: 'Category 1',
    countProducts: 1,
  },
  {
    id: 2,
    name: 'Category 2',
    countProducts: 2,
  },
  {
    id: 3,
    name: 'Category 3',
    countProducts: 0,
  },
  {
    id: 4,
    name: 'Category 4',
    countProducts: 13,
  },
];

const CategoriesList: React.FC = () => {
  return (
    <List>
      {categoryItems.map((category, index) => (
        <React.Fragment key={category.id}>
          <CategoriesListItem category={category}></CategoriesListItem>
          {index >= 0 && index < categoryItems.length - 1 && <Divider></Divider>}
        </React.Fragment>
      ))}
    </List>
  );
};

export default CategoriesList;
