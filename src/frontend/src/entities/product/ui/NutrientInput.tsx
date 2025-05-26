import { InputAdornment, TextField } from '@mui/material';
import { forwardRef, type ChangeEventHandler } from 'react';
import { type NutrientType } from '../model/nutrients';
import { NutrientIcon } from './NutrientIcon';

interface Props {
  label: string;
  placeholder: string;
  nutrientType: NutrientType;
  value: number | null;
  error: boolean;
  helperText: string;
  onChange: ChangeEventHandler;
}

export const NutrientInput = forwardRef<HTMLDivElement | null, Props>(
  ({ label, placeholder, nutrientType, value, ...props }, ref) => (
    <TextField
      {...props}
      ref={ref}
      fullWidth
      label={label}
      placeholder={placeholder}
      value={value ?? ''}
      margin="dense"
      size="small"
      onFocus={event => event.target.select()}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <NutrientIcon type={nutrientType} />
            </InputAdornment>
          ),
          endAdornment: <InputAdornment position="end">g</InputAdornment>,
        },
        htmlInput: {
          type: 'text',
          inputMode: 'decimal',
        },
      }}
    />
  ),
);

NutrientInput.displayName = 'NutrientInput';
