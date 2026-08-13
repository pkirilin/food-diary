import { InputAdornment, TextField } from '@mui/material';
import { type ChangeEventHandler, type FC, type Ref } from 'react';
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
  ref?: Ref<HTMLDivElement>;
  onChange: ChangeEventHandler;
  onSuggest: () => void;
}

export const NutritionValueInput: FC<Props> = ({
  label,
  placeholder,
  type,
  value,
  disabled,
  suggesting,
  suggestDisabled,
  ref,
  onSuggest,
  ...props
}) => (
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
            <NutritionSuggestButton
              label={label}
              suggesting={suggesting}
              disabled={suggestDisabled}
              onClick={onSuggest}
            />
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
