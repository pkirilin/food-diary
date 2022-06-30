import { Category } from '../types';

type CategoryListItemNewProps = {
  category: Category;
};

function getCountProductsLabelText({ name, countProducts }: Category) {
  if (countProducts === 0) {
    return `There are no products in ${name}`;
  }

  if (countProducts === 1) {
    return `There are ${countProducts} product in ${name}`;
  }

  return `There are ${countProducts} products in ${name}`;
}

export default function CategoryListItemNew({ category }: CategoryListItemNewProps) {
  return (
    <div>
      <div>{category.name}</div>
      <div aria-label={getCountProductsLabelText(category)}>{category.countProducts}</div>
    </div>
  );
}
