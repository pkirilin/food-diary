import { Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import CategoriesListNew from '../components/CategoriesListNew';
import CreateNewCategory from '../components/CreateNewCategory';

const Categories: React.FC = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary | Categories</title>
      </Helmet>
      <Typography variant="h1" gutterBottom>
        Categories
      </Typography>
      <CategoriesListNew></CategoriesListNew>
      <CreateNewCategory></CreateNewCategory>
    </React.Fragment>
  );
};

export default Categories;
