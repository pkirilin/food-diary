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
  Typography,
} from '@mui/material';
import { type ReactNode, type FC, type MouseEventHandler } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { noteSchema, type NoteFormValues, type NoteFormValuesProduct } from '../model';

interface Props {
  formId: string;
  defaultValues: NoteFormValues;
  productForEditLoading: boolean;
  isSubmitting: boolean;
  submitDisabled: boolean;
  onSubmit: OnSubmitNoteFn;
  onLoadProductForEdit: OnEditProductFn;
  onDiscardProduct: () => void;
}

export type OnSubmitNoteFn = (note: NoteFormValues) => Promise<void>;

export type OnEditProductFn = (productId: number) => Promise<void>;

const hasMissingNutritionValues = ({
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: NoteFormValuesProduct): boolean =>
  [protein, fats, carbs, sugar, salt].every(value => value === null);

export const NoteForm: FC<Props> = ({
  formId,
  defaultValues,
  productForEditLoading,
  isSubmitting,
  submitDisabled,
  onSubmit,
  onLoadProductForEdit,
  onDiscardProduct,
}) => {
  const { control, handleSubmit, getValues } = useForm<NoteFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(noteSchema),
    defaultValues,
  });

  const handleEditProduct: MouseEventHandler = async () => {
    const { product } = getValues();

    if (product) {
      onLoadProductForEdit(product.id);
    }
  };

  const renderHelperText = (): ReactNode => {
    const { product } = getValues();

    if (product && hasMissingNutritionValues(product)) {
      return (
        <Typography variant="caption" component="span" color="warning">
          Nutrition values are missing
        </Typography>
      );
    }

    return ' ';
  };

  return (
    <form id={formId} onSubmit={handleSubmit(values => onSubmit(values))}>
      <TextField
        label="Product"
        value={defaultValues.product?.name}
        variant="outlined"
        fullWidth
        margin="normal"
        helperText={renderHelperText()}
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
                    onClick={onDiscardProduct}
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
