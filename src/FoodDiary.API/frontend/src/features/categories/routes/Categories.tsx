import { Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import CategoriesList from '../components/CategoriesList';
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
      <CategoriesList></CategoriesList>
      <CreateNewCategory></CreateNewCategory>
    </React.Fragment>
  );
};

export default Categories;
