import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@mui/material';
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppSelector } from '@/app/store';
import { noteApi } from '@/entities/note';
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
  const noteDraft = useAppSelector(state => state.addNote.draft);

  // TODO: add validation
  return (
    <form
      onSubmit={handleSubmit(({ quantity }) => {
        if (!noteDraft?.product || noteDraft.product.freeSolo) {
          return;
        }

        createNote({
          date: noteDraft.date,
          mealType: noteDraft.mealType,
          displayOrder: noteDraft.displayOrder,
          productId: noteDraft.product.id,
          productQuantity: quantity,
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
