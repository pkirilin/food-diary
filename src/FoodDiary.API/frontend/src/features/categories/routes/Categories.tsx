import { Fragment } from 'react';
import CategoriesListNew from '../components/CategoriesListNew';
import CreateNewCategory from '../components/CreateNewCategory';

export default function Categories() {
  return (
    <Fragment>
      <CategoriesListNew></CategoriesListNew>
      <CreateNewCategory></CreateNewCategory>
    </Fragment>
  );
}
