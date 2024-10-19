import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { noteApi } from '@/entities/note';
import { MealType } from '@/entities/note/model';
import { Button } from '@/shared/ui';

const schema = z.object({
  quantity: z.coerce.number().min(1).max(1000),
});

type FormValues = z.infer<typeof schema>;

export const ProductQuantityInput: FC = () => {
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 100,
    },
  });

  const [createNote] = noteApi.useCreateNoteMutation();

  // TODO: add validation
  return (
    <form
      onSubmit={handleSubmit(data => {
        // TODO: fill with real values
        createNote({
          date: '2024-10-01',
          mealType: MealType.Breakfast,
          productId: 1,
          productQuantity: data.quantity,
          displayOrder: 1,
        });
      })}
    >
      <TextField
        {...register('quantity')}
        fullWidth
        margin="normal"
        helperText=" "
        label="Quantity"
        placeholder="Product quantity, g"
        inputMode="numeric"
      />
      <Button type="submit" variant="contained" fullWidth>
        Add
      </Button>
    </form>
  );
};
