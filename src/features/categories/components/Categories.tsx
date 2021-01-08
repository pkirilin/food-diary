import React from 'react';
import { Divider, Paper } from '@material-ui/core';
import CategoriesList from './CategoriesList';
import CategoriesHeader from './CategoriesHeader';

const Categories: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <CategoriesHeader></CategoriesHeader>
      <Divider></Divider>
      <CategoriesList></CategoriesList>
    </Paper>
  );
};

export default Categories;
