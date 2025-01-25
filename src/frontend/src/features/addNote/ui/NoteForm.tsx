import { zodResolver } from '@hookform/resolvers/zod';
import CancelIcon from '@mui/icons-material/Cancel';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { actions, selectors, noteSchema, type NoteFormValues } from '../model';

interface Props {
  defaultValues: NoteFormValues;
  onSubmit: (values: NoteFormValues) => Promise<void>;
}

export const NoteForm: FC<Props> = ({ defaultValues, onSubmit }) => {
  const { control, formState, handleSubmit } = useForm<NoteFormValues>({
    mode: 'onChange',
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const noteDraft = useAppSelector(state => state.addNote.note);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(actions.draftValidated(formState.isValid));
  }, [dispatch, formState.isValid]);

  return (
    <form id={activeFormId} onSubmit={handleSubmit(values => onSubmit(values))}>
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
            onFocus={event => event.target.select()}
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
    </form>
  );
};
