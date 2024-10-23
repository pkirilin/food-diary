import { zodResolver } from '@hookform/resolvers/zod';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi } from '@/entities/note';
import { Button } from '@/shared/ui';
import { actions } from '../model';

const schema = z.object({
  quantity: z.coerce.number().int().min(1).max(999),
});

type FormValues = z.infer<typeof schema>;

export const QuantityForm: FC = () => {
  const { control, formState, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 100,
    },
  });

  const [createNote] = noteApi.useCreateNoteMutation();
  const noteDraft = useAppSelector(state => state.addNote.draft);
  const dispatch = useAppDispatch();

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
        margin="normal"
        slotProps={{
          input: {
            readOnly: true,
            // TODO: drop
            endAdornment: (
              <IconButton edge="end" onClick={() => dispatch(actions.productDiscarded())}>
                <BackspaceIcon />
              </IconButton>
            ),
          },
        }}
      />
      <Controller
        name="quantity"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            margin="normal"
            label="Quantity"
            placeholder="Product quantity, g"
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? ' '}
            slotProps={{
              input: {
                inputMode: 'numeric',
                endAdornment: <InputAdornment position="end">g</InputAdornment>,
              },
            }}
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!formState.isValid}
        loading={formState.isSubmitting}
      >
        Add
      </Button>
    </form>
  );
};
