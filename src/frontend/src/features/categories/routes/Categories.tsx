import { type FC } from 'react';
import CategoriesList from '../components/CategoriesList';
import CreateCategory from '../components/CreateCategory';
import { useCategories } from '../model';

const Categories: FC = () => {
  const categories = useCategories();

  return (
    <>
      <CategoriesList categories={categories.data} />
      <CreateCategory />
    </>
  );
};

export default Categories;
