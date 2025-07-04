import { zodResolver } from '@hookform/resolvers/zod';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  CircularProgress,
  Grid2,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type SelectOption } from '@/shared/types';
import { type ProductFormValues, productSchema, nutritionValuesConfig } from '../model';
import { NutritionValueIcon } from './NutritionValueIcon';
import { NutritionValueInput } from './NutritionValueInput';

interface Props {
  formId: string;
  defaultValues: ProductFormValues;
  categories: SelectOption[];
  categoriesLoading: boolean;
  onSubmit: OnSubmitProductFn;
}

export type OnSubmitProductFn = (product: ProductFormValues) => Promise<void>;

export const ProductForm: FC<Props> = ({
  formId,
  defaultValues,
  categories,
  categoriesLoading,
  onSubmit,
}) => {
  const { control, handleSubmit, setValue, getValues } = useForm<ProductFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (categories.length > 0) {
      setValue('category', categories[0], { shouldValidate: true });
    }
  }, [categories, setValue]);

  const atLeastOneNutritionFieldHasValue = getValues([
    'protein',
    'fats',
    'carbs',
    'sugar',
    'salt',
  ]).some(value => value !== null);

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
      <Grid2 container spacing={2}>
        <Grid2 size={6}>
          <Controller
            name="calories"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label="Calories"
                placeholder="Calories per 100 g, kcal"
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ' '}
                onFocus={event => event.target.select()}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <NutritionValueIcon type="calories" size="medium" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {nutritionValuesConfig.calories.unit}
                      </InputAdornment>
                    ),
                  },
                  htmlInput: {
                    type: 'text',
                    inputMode: 'numeric',
                  },
                }}
              />
            )}
          />
        </Grid2>
        <Grid2 size={6}>
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
        </Grid2>
      </Grid2>
      <Accordion variant="outlined" defaultExpanded={atLeastOneNutritionFieldHasValue}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="nutrition-components-panel-content"
          id="nutrition-components-panel-header"
        >
          <Typography component="span">Nutrition</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <Controller
                name="protein"
                control={control}
                render={({ field, fieldState }) => (
                  <NutritionValueInput
                    {...field}
                    type="protein"
                    label="Protein"
                    placeholder="Protein, g"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name="fats"
                control={control}
                render={({ field, fieldState }) => (
                  <NutritionValueInput
                    {...field}
                    type="fats"
                    label="Fats"
                    placeholder="Fats, g"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name="carbs"
                control={control}
                render={({ field, fieldState }) => (
                  <NutritionValueInput
                    {...field}
                    type="carbs"
                    label="Carbs"
                    placeholder="Carbs, g"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name="sugar"
                control={control}
                render={({ field, fieldState }) => (
                  <NutritionValueInput
                    {...field}
                    type="sugar"
                    label="Sugar"
                    placeholder="Sugar, g"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name="salt"
                control={control}
                render={({ field, fieldState }) => (
                  <NutritionValueInput
                    {...field}
                    type="salt"
                    label="Salt"
                    placeholder="Salt, g"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
          </Grid2>
        </AccordionDetails>
      </Accordion>
    </form>
  );
};
