import { zodResolver } from '@hookform/resolvers/zod';
import CancelIcon from '@mui/icons-material/Cancel';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { noteApi } from '@/entities/note';
import { actions, selectors, noteSchema, type NoteFormValues } from '../model';

interface Props {
  defaultValues: NoteFormValues;
}

export const NoteForm: FC<Props> = ({ defaultValues }) => {
  const { control, formState, handleSubmit } = useForm<NoteFormValues>({
    mode: 'onChange',
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const [createNote] = noteApi.useCreateNoteMutation();
  const noteDraft = useAppSelector(state => state.addNote.note);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(actions.draftValidated(formState.isValid));
  }, [dispatch, formState.isValid]);

  return (
    <form
      id={activeFormId}
      onSubmit={handleSubmit(({ quantity }) => {
        if (!noteDraft?.product) {
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
      {/* TODO: show meal type */}
      <TextField
        label="Product"
        value={noteDraft?.product?.name}
        fullWidth
        margin="normal"
        helperText=" "
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <Tooltip title="Discard and choose another product" placement="left">
                <IconButton edge="end" onClick={() => dispatch(actions.productDraftDiscarded())}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
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
    </form>
  );
};
