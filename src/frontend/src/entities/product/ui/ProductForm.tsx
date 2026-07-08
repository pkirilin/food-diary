import { zodResolver } from '@hookform/resolvers/zod';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  CircularProgress,
  Grid2,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { type FC, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { parseClientError } from '@/shared/api';
import { type SelectOption } from '@/shared/types';
import { useSuggestNutrition } from '../lib/useSuggestNutrition';
import {
  type NutritionValueType,
  type ProductFormValues,
  productSchema,
  nutritionValuesConfig,
} from '../model';
import { NutritionSuggestButton } from './NutritionSuggestButton';
import { NutritionValueIcon } from './NutritionValueIcon';
import { NutritionValueInput } from './NutritionValueInput';

interface Props {
  formId: string;
  defaultValues: ProductFormValues;
  categories: SelectOption[];
  categoriesLoading: boolean;
  onSubmit: OnSubmitProductFn;
  onNutritionSuggestingChange: (nutritionSuggesting: boolean) => void;
}

export type OnSubmitProductFn = (product: ProductFormValues) => Promise<void>;

interface SnackbarState {
  severity: 'error' | 'info';
  message: string;
}

const MIN_NAME_LENGTH = 3;

export const ProductForm: FC<Props> = ({
  formId,
  defaultValues,
  categories,
  categoriesLoading,
  onSubmit,
  onNutritionSuggestingChange,
}) => {
  const { control, handleSubmit, getValues, setValue } = useForm<ProductFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  // TODO: move ALL suggestions-related behaviour + state to `useNutritionSuggestions` hook
  const suggestNutrition = useSuggestNutrition();
  const [suggestingField, setSuggestingField] = useState<NutritionValueType | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  const name = useWatch({ control, name: 'name' });
  const isSuggesting = suggestingField !== null;
  const suggestDisabled = name.trim().length < MIN_NAME_LENGTH || isSuggesting;

  const atLeastOneNutritionFieldHasValue = getValues([
    'protein',
    'fats',
    'carbs',
    'sugar',
    'salt',
  ]).some(value => value !== null);

  const [nutritionExpanded, setNutritionExpanded] = useState(atLeastOneNutritionFieldHasValue);

  const applyEligible = (
    field: NutritionValueType,
    clicked: NutritionValueType,
    value: number | null,
  ): void => {
    if (value === null) {
      return;
    }

    if (getValues(field) === null || field === clicked) {
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleSuggest = async (clicked: NutritionValueType): Promise<void> => {
    setSuggestingField(clicked);
    onNutritionSuggestingChange?.(true);

    try {
      const suggestion = await suggestNutrition(getValues('name'));
      const values = [
        suggestion.calories,
        suggestion.protein,
        suggestion.fats,
        suggestion.carbs,
        suggestion.sugar,
        suggestion.salt,
      ];

      if (values.every(value => value === null)) {
        setSnackbar({
          severity: 'info',
          message: "Couldn't estimate nutrition for this product",
        });
        return;
      }

      applyEligible('calories', clicked, suggestion.calories);
      applyEligible('protein', clicked, suggestion.protein);
      applyEligible('fats', clicked, suggestion.fats);
      applyEligible('carbs', clicked, suggestion.carbs);
      applyEligible('sugar', clicked, suggestion.sugar);
      applyEligible('salt', clicked, suggestion.salt);

      const hasMacroSuggestion = [
        suggestion.protein,
        suggestion.fats,
        suggestion.carbs,
        suggestion.sugar,
        suggestion.salt,
      ].some(value => value !== null);

      if (hasMacroSuggestion) {
        setNutritionExpanded(true);
      }
    } catch (error) {
      const clientError = parseClientError(error);
      setSnackbar({ severity: 'error', message: clientError.message });
    } finally {
      setSuggestingField(null);
      onNutritionSuggestingChange?.(false);
    }
  };

  const handleSuggestClick = (clicked: NutritionValueType) => (): void => {
    void handleSuggest(clicked);
  };

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
            disabled={isSuggesting}
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
            disabled={isSuggesting}
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
                disabled={isSuggesting}
                label={`Calories, ${nutritionValuesConfig.calories.unit}`}
                placeholder="Calories per 100 g"
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
                        <NutritionSuggestButton
                          label="Calories"
                          suggesting={suggestingField === 'calories'}
                          disabled={suggestDisabled}
                          onClick={handleSuggestClick('calories')}
                        />
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
                disabled={isSuggesting}
                label="Default quantity, g"
                placeholder="Default quantity"
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ' '}
                onFocus={event => event.target.select()}
                slotProps={{
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
      <Accordion
        variant="outlined"
        expanded={nutritionExpanded}
        onChange={(_, expanded) => setNutritionExpanded(expanded)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="nutrition-components-panel-content"
          id="nutrition-components-panel-header"
        >
          <Typography component="span">Nutrition</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* TODO: remove boilerplate */}
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
                    placeholder="Protein"
                    disabled={isSuggesting}
                    suggesting={suggestingField === 'protein'}
                    suggestDisabled={suggestDisabled}
                    onSuggest={handleSuggestClick('protein')}
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
                    placeholder="Fats"
                    disabled={isSuggesting}
                    suggesting={suggestingField === 'fats'}
                    suggestDisabled={suggestDisabled}
                    onSuggest={handleSuggestClick('fats')}
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
                    placeholder="Carbs"
                    disabled={isSuggesting}
                    suggesting={suggestingField === 'carbs'}
                    suggestDisabled={suggestDisabled}
                    onSuggest={handleSuggestClick('carbs')}
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
                    placeholder="Sugar"
                    disabled={isSuggesting}
                    suggesting={suggestingField === 'sugar'}
                    suggestDisabled={suggestDisabled}
                    onSuggest={handleSuggestClick('sugar')}
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
                    placeholder="Salt"
                    disabled={isSuggesting}
                    suggesting={suggestingField === 'salt'}
                    suggestDisabled={suggestDisabled}
                    onSuggest={handleSuggestClick('salt')}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ' '}
                  />
                )}
              />
            </Grid2>
          </Grid2>
        </AccordionDetails>
      </Accordion>
      <Snackbar open={snackbar !== null} autoHideDuration={6000} onClose={() => setSnackbar(null)}>
        <Alert
          severity={snackbar?.severity ?? 'info'}
          onClose={() => setSnackbar(null)}
          sx={{ width: '100%' }}
        >
          {snackbar?.message ?? ''}
        </Alert>
      </Snackbar>
    </form>
  );
};
