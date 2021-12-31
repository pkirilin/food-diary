import React from 'react';
import { Helmet } from 'react-helmet';
import { Divider, Paper } from '@material-ui/core';
import CategoriesList from './CategoriesList';
import CategoriesHeader from './CategoriesHeader';

const Categories: React.FC = () => {
  return (
    <Paper variant="outlined" square>
      <Helmet>
        <title>Food diary | Categories</title>
      </Helmet>
      <CategoriesHeader></CategoriesHeader>
      <Divider></Divider>
      <CategoriesList></CategoriesList>
    </Paper>
  );
};

export default Categories;
