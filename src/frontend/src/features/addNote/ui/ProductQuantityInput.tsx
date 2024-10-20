import { zodResolver } from '@hookform/resolvers/zod';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi } from '@/entities/note';
import { Button } from '@/shared/ui';
import { actions } from '../model';

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
  const dispatch = useAppDispatch();

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
        label="Product"
        value={noteDraft?.product?.name}
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <IconButton edge="end" onClick={() => dispatch(actions.productDiscarded())}>
                <BackspaceIcon />
              </IconButton>
            ),
          },
        }}
        margin="normal"
      />
      <TextField
        {...register('quantity')}
        fullWidth
        margin="normal"
        helperText=" "
        label="Quantity"
        placeholder="Product quantity, g"
        inputMode="numeric"
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">g</InputAdornment>,
          },
        }}
      />
      <Button type="submit" variant="contained" fullWidth>
        Add
      </Button>
    </form>
  );
};
