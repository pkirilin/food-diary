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
  onChange: ChangeEventHandler;
  disabled?: boolean;
  generating?: boolean;
  suggestDisabled?: boolean;
  onSuggest?: () => void;
}

export const NutritionValueInput = forwardRef<HTMLDivElement | null, Props>(
  function NutritionValueInput(
    { label, placeholder, type, value, disabled, generating, suggestDisabled, onSuggest, ...props },
    ref,
  ) {
    return (
      <TextField
        {...props}
        ref={ref}
        fullWidth
        disabled={disabled}
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
              <InputAdornment position="end">
                {nutritionValuesConfig[type].unit}
                {onSuggest != null ? (
                  <NutritionSuggestButton
                    label={label}
                    generating={generating ?? false}
                    disabled={suggestDisabled ?? false}
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
