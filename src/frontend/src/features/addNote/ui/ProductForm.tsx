import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, CircularProgress, InputAdornment, TextField } from '@mui/material';
import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type SelectOption } from '@/shared/types';
import { type ProductFormValues, productSchema } from '../model';

interface Props {
  formId: string;
  defaultValues: ProductFormValues;
  categories: SelectOption[];
  categoriesLoading: boolean;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onValidate: (isValid: boolean) => void;
}

export const ProductForm: FC<Props> = ({
  formId,
  defaultValues,
  categories,
  categoriesLoading,
  onSubmit,
  onValidate,
}) => {
  const { control, formState, handleSubmit, setValue } = useForm<ProductFormValues>({
    mode: 'onChange',
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    onValidate(formState.isValid);
  }, [formState.isValid, onValidate]);

  useEffect(() => {
    if (categories.length > 0) {
      setValue('category', categories[0], { shouldValidate: true });
    }
  }, [categories, setValue]);

  return (
    <form id={formId} onSubmit={handleSubmit(data => onSubmit(data))}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            autoFocus
            label="Name"
            placeholder="Product name"
            margin="normal"
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? ' '}
          />
        )}
      />
      <Controller
        name="caloriesCost"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            label="Calories cost"
            placeholder="Calories cost per 100 g, kcal"
            margin="normal"
            error={!!fieldState.error}
            helperText={fieldState.error?.message ?? ' '}
            onFocus={event => event.target.select()}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">kcal</InputAdornment>,
              },
              htmlInput: {
                type: 'text',
                inputMode: 'numeric',
              },
            }}
          />
        )}
      />
      <Controller
        name="defaultQuantity"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            label="Default quantity"
            placeholder="Default quantity, g"
            margin="normal"
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
      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <Autocomplete
            {...field}
            onChange={(_, value) => field.onChange(value)}
            blurOnSelect="touch"
            options={categories}
            getOptionLabel={option => option.name}
            isOptionEqualToValue={(first, second) => first.name === second.name}
            renderInput={params => (
              <TextField
                {...params}
                label="Category"
                placeholder="Choose category"
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ' '}
                margin="normal"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: categoriesLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      params.InputProps.endAdornment
                    ),
                  },
                }}
              />
            )}
          />
        )}
      />
    </form>
  );
};
