import { Alert, Box, CircularProgress } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { toMealDraftProductFromResponse } from '../lib/mapping';
import { useProductToEdit } from '../lib/useProductToEdit';
import { FoodLogQuantityForm } from './FoodLogQuantityForm';

interface Props {
  productId: number;
  onDone: () => void;
  onEditProduct: () => void;
}

export const LogFoodProductDetail: FC<Props> = ({ productId, onDone, onEditProduct }) => {
  const { product, productLoadFailed } = useProductToEdit(productId);

  const foodLog = useAppSelector(state =>
    foodLogModel.selectors.foodLogOfProduct(state, productId),
  );

  if (product) {
    return (
      <FoodLogQuantityForm
        product={toMealDraftProductFromResponse(product)}
        foodLog={foodLog}
        onDone={onDone}
        onEditProduct={onEditProduct}
      />
    );
  }

  if (productLoadFailed) {
    return <Alert severity="error">The product could not be loaded</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};
