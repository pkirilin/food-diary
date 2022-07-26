import { Typography } from '@mui/material';
import React from 'react';
import { Helmet } from 'react-helmet';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';

const Categories: React.FC = () => {
  return (
    <React.Fragment>
      <Helmet>
        <title>Food diary | Categories</title>
      </Helmet>
      <Typography variant="h1" gutterBottom>
        Categories
      </Typography>
      <CategoriesList />
      <CreateCategory />
    </React.Fragment>
  );
};

export default Categories;
