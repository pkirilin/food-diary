import { zodResolver } from '@hookform/resolvers/zod';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { type FC, type MouseEventHandler } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { actions, selectors, noteSchema, type NoteFormValues } from '../model';

interface Props {
  defaultValues: NoteFormValues;
  productForEditLoading: boolean;
  isSubmitting: boolean;
  submitDisabled: boolean;
  onSubmit: OnSubmitNoteFn;
  onLoadProductForEdit: OnEditProductFn;
}

export type OnSubmitNoteFn = (note: NoteFormValues) => Promise<void>;

export type OnEditProductFn = (productId: number) => Promise<void>;

export const NoteForm: FC<Props> = ({
  defaultValues,
  productForEditLoading,
  isSubmitting,
  submitDisabled,
  onSubmit,
  onLoadProductForEdit,
}) => {
  const { control, handleSubmit, getValues } = useForm<NoteFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const noteDraft = useAppSelector(state => state.manageNote.note);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dispatch = useAppDispatch();

  const handleEditProduct: MouseEventHandler = async () => {
    const { product } = getValues();

    if (product) {
      onLoadProductForEdit(product.id);
    }
  };

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
              <InputAdornment position="end">
                {productForEditLoading ? (
                  <Box p={1}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Tooltip title="Edit product">
                    <IconButton
                      disabled={isSubmitting || submitDisabled}
                      onClick={handleEditProduct}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Discard and choose another product">
                  <IconButton
                    edge="end"
                    disabled={isSubmitting || submitDisabled}
                    onClick={() => dispatch(actions.productDraftDiscarded())}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
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
