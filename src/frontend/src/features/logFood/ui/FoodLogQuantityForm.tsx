import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { type FC } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { holdSoftKeyboardForNextField, quantitySchema } from '@/shared/lib';

const quantityFormSchema = z.object({ quantity: quantitySchema });

interface Props {
  product: foodLogModel.MealDraftProduct;
  foodLog: foodLogModel.MealDraftFoodLog | null;
  onDone: () => void;
  onEditProduct: () => void;
}

export const FoodLogQuantityForm: FC<Props> = ({ product, foodLog, onDone, onEditProduct }) => {
  const dispatch = useAppDispatch();

  const { control, handleSubmit, formState } = useForm({
    mode: 'onChange',
    resolver: zodResolver(quantityFormSchema),
    defaultValues: { quantity: foodLog?.quantity ?? product.defaultQuantity },
  });

  const typedQuantity = quantitySchema.safeParse(useWatch({ control, name: 'quantity' }));
  const quantityInvalid = formState.errors.quantity !== undefined;

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={event => {
        if (!quantityInvalid) {
          holdSoftKeyboardForNextField();
        }

        void handleSubmit(({ quantity }) => {
          if (foodLog === null) {
            dispatch(foodLogModel.actions.foodLogAdded({ product, quantity }));
          } else {
            dispatch(
              foodLogModel.actions.foodLogQuantityChanged({ productId: product.id, quantity }),
            );
          }

          onDone();
        })(event);
      }}
    >
      <div>
        <Typography variant="h6" component="h2">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`${product.calories} kcal per 100 g`}
        </Typography>
      </div>
      <Controller
        name="quantity"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            autoFocus
            fullWidth
            label="Quantity"
            error={quantityInvalid}
            helperText={
              typedQuantity.success && !quantityInvalid
                ? `${foodLogModel.calculateCalories({ product, quantity: typedQuantity.data })} kcal`
                : 'Enter a whole number from 10 to 1000'
            }
            onFocus={event => {
              event.target.select();
            }}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">g</InputAdornment>,
              },
              htmlInput: {
                type: 'text',
                inputMode: 'numeric',
              },
            }}
          />
        )}
      />
      <Stack direction="row" spacing={2} useFlexGap>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            onClick={() => {
              holdSoftKeyboardForNextField();
              onEditProduct();
            }}
          >
            Edit product
          </Button>
        </Box>
        <Button type="submit" variant="contained" disabled={quantityInvalid}>
          {foodLog === null ? 'Add' : 'Save'}
        </Button>
      </Stack>
    </Stack>
  );
};
