import { Typography } from '@mui/material';
import { Category } from '../types';

type CategoryProductsCountProps = {
  category: Category;
};

const ProductsCount = ({ category }: CategoryProductsCountProps) => {
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
