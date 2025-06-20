import { InputAdornment, TextField } from '@mui/material';
import { forwardRef, type ChangeEventHandler } from 'react';
import { nutritionValuesConfig, type NutritionValueType } from '../model';
import { NutritionValueIcon } from './NutritionValueIcon';

interface Props {
  label: string;
  placeholder: string;
  type: NutritionValueType;
  value: number | null;
  error: boolean;
  helperText: string;
  onChange: ChangeEventHandler;
}

export const NutritionValueInput = forwardRef<HTMLDivElement | null, Props>(
  ({ label, placeholder, type, value, ...props }, ref) => (
    <TextField
      {...props}
      ref={ref}
      fullWidth
      label={`${label} (optional)`}
      placeholder={placeholder}
      value={value ?? ''}
      margin="none"
      size="small"
      onFocus={event => event.target.select()}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <NutritionValueIcon type={type} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">{nutritionValuesConfig[type].unit}</InputAdornment>
          ),
        },
        htmlInput: {
          type: 'text',
          inputMode: 'decimal',
        },
      }}
    />
  ),
);

NutritionValueInput.displayName = 'NutritionComponentInput';
