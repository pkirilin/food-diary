import { InputAdornment, TextField } from '@mui/material';
import { forwardRef, type ChangeEventHandler } from 'react';
import { nutritionComponents, type NutritionComponent } from '../model';
import { NutritionComponentIcon } from './NutritionComponentIcon';

interface Props {
  label: string;
  placeholder: string;
  type: NutritionComponent;
  value: number | null;
  error: boolean;
  helperText: string;
  onChange: ChangeEventHandler;
}

export const NutritionComponentInput = forwardRef<HTMLDivElement | null, Props>(
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
              <NutritionComponentIcon type={type} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">{nutritionComponents[type].unit}</InputAdornment>
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

NutritionComponentInput.displayName = 'NutritionComponentInput';
