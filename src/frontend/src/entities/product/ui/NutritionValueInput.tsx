import { InputAdornment, TextField } from '@mui/material';
import { forwardRef, type ChangeEventHandler } from 'react';
import { nutritionValuesConfig, type NutritionValueType } from '../model';
import { NutritionSuggestButton } from './NutritionSuggestButton';
import { NutritionValueIcon } from './NutritionValueIcon';

interface Props {
  label: string;
  placeholder: string;
  type: NutritionValueType;
  value: number | null;
  error: boolean;
  helperText: string;
  disabled: boolean;
  suggesting: boolean;
  suggestDisabled: boolean;
  onChange: ChangeEventHandler;
  onSuggest: () => void;
}

export const NutritionValueInput = forwardRef<HTMLDivElement | null, Props>(
  function NutritionValueInput(
    { label, placeholder, type, value, disabled, suggesting, suggestDisabled, onSuggest, ...props },
    ref,
  ) {
    return (
      <TextField
        {...props}
        ref={ref}
        fullWidth
        disabled={disabled}
        label={`${label}, ${nutritionValuesConfig[type].unit} (optional)`}
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
              <InputAdornment position="end">
                {onSuggest != null ? (
                  <NutritionSuggestButton
                    label={label}
                    suggesting={suggesting}
                    disabled={suggestDisabled}
                    onClick={onSuggest}
                  />
                ) : null}
              </InputAdornment>
            ),
          },
          htmlInput: {
            type: 'text',
            inputMode: 'decimal',
          },
        }}
      />
    );
  },
);
