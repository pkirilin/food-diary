import { Alert, Box, CircularProgress } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { toMealDraftProductFromResponse } from '../lib/mapping';
import { useFreshProduct } from '../lib/useFreshProduct';
import { FoodLogQuantityForm } from './FoodLogQuantityForm';

interface Props {
  productId: number;
  onDone: () => void;
  onEditProduct: () => void;
}

export const LogFoodProductDetail: FC<Props> = ({ productId, onDone, onEditProduct }) => {
  const { product, loadFailed } = useFreshProduct(productId);
  const foodLog = useAppSelector(state =>
    foodLogModel.selectors.foodLogOfProduct(state, productId),
  );

  if (product !== undefined) {
    return (
      <FoodLogQuantityForm
        product={toMealDraftProductFromResponse(product)}
        foodLog={foodLog}
        onDone={onDone}
        onEditProduct={onEditProduct}
      />
    );
  }

  if (loadFailed) {
    return <Alert severity="error">The product could not be loaded</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};
