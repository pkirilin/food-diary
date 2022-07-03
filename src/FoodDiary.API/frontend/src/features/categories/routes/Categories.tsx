import { Typography } from '@mui/material';
import { Fragment } from 'react';
import CategoriesListNew from '../components/CategoriesListNew';
import CreateNewCategory from '../components/CreateNewCategory';

export default function Categories() {
  return (
    <Fragment>
      <Typography variant="h1" gutterBottom>
        Categories
      </Typography>
      <CategoriesListNew></CategoriesListNew>
      <CreateNewCategory></CreateNewCategory>
    </Fragment>
  );
}
