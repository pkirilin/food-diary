import CategoryIcon from '@mui/icons-material/Category';
import { Chip, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store';
import { filterByCategoryChanged } from '../store';

const ProductsFilterAppliedParams: FC = () => {
  const category = useAppSelector(state => state.products.filter.category);
  const dispatch = useAppDispatch();

  const handleCategoryClear = (): void => {
    dispatch(filterByCategoryChanged(null));
  };

  if (!category) {
    return null;
  }

  return (
    <Tooltip title="Applied filter: category">
      <Chip
        variant="outlined"
        icon={<CategoryIcon />}
        label={category.name}
        onDelete={handleCategoryClear}
      />
    </Tooltip>
  );
};

export default ProductsFilterAppliedParams;
