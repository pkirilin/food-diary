import { Typography } from '@mui/material';
import { type FC } from 'react';
import { type Category } from '../types';

interface CategoryProductsCountProps {
  category: Category;
}

const ProductsCount: FC<CategoryProductsCountProps> = ({
  category,
}: CategoryProductsCountProps) => {
  const { countProducts: value } = category;
  const prefix = value === 0 ? 'no' : value.toString();
  const suffix = value === 1 ? 'product' : 'products';

  return (
    <Typography aria-label={`There are ${prefix} ${suffix} in ${category.name}`}>
      {`${prefix} ${suffix}`}
    </Typography>
  );
};

export default ProductsCount;
