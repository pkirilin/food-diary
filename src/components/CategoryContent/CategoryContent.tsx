import React from 'react';
import { useParams } from 'react-router-dom';

type CategoryContentProps = {};

const CategoryContent: React.FC<CategoryContentProps> = () => {
  const { id: categoryId } = useParams();

  return <div>categoryId = {categoryId}</div>;
};

export default CategoryContent;
