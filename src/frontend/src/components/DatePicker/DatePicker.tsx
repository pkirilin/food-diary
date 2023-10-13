import { TextField } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import React from 'react';
import { DatePickerProps } from './DatePicker.types';

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  placeholder,
  date,
  autoFocus,
  isInvalid,
  helperText,
  onChange,
}) => {
  return (
    <MuiDatePicker
      label={label}
      value={date}
      onChange={onChange}
      inputFormat="dd.MM.yyyy"
      renderInput={params => (
        <TextField
          {...params}
          margin="normal"
          fullWidth
          autoFocus={autoFocus}
          placeholder={placeholder}
          error={isInvalid}
          helperText={helperText}
        />
      )}
    />
  );
};

export default DatePicker;
