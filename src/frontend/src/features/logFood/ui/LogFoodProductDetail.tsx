import { Alert, Box, CircularProgress } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { productApi } from '@/entities/product';
import { fromGetProductByIdResponse } from '../lib/mapping';
import { FoodLogQuantityForm } from './FoodLogQuantityForm';

interface Props {
  productId: number;
  onDone: () => void;
  onEditProduct: () => void;
}

export const LogFoodProductDetail: FC<Props> = ({ productId, onDone, onEditProduct }) => {
  const { data, isError } = productApi.useProductByIdQuery(productId);
  const foodLog = useAppSelector(state =>
    foodLogModel.selectors.foodLogOfProduct(state, productId),
  );

  if (data !== undefined) {
    return (
      <FoodLogQuantityForm
        product={fromGetProductByIdResponse(data)}
        foodLog={foodLog}
        onDone={onDone}
        onEditProduct={onEditProduct}
      />
    );
  }

  if (isError) {
    return <Alert severity="error">The product could not be loaded</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
};
