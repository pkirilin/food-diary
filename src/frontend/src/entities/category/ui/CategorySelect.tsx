import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { type SyntheticEvent, type FC } from 'react';
import { type SelectOption, type SelectProps } from '@/shared/types';

interface CategorySelectProps extends SelectProps<SelectOption> {
  options: SelectOption[];
  optionsLoading: boolean;
}

export const CategorySelect: FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
  options,
  optionsLoading,
}) => {
  const handleChange = (_: SyntheticEvent, newValue: SelectOption | null): void => {
    setValue(newValue);
  };

  return (
    <Autocomplete
      blurOnSelect="touch"
      value={value}
      options={options}
      getOptionLabel={option => option.name}
      isOptionEqualToValue={(first, second) => first.name === second.name}
      onChange={handleChange}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={isInvalid}
          helperText={helperText}
          margin="normal"
          InputProps={{
            ...params.InputProps,
            endAdornment: optionsLoading ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              params.InputProps.endAdornment
            ),
          }}
        />
      )}
    />
  );
};
