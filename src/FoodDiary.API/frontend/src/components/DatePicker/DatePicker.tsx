import { TextField } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';

type DatePickerProps = {
  label: string;
  placeholder: string;
  date: Date | null;
  autoFocus?: boolean;
  isInvalid?: boolean;
  helperText?: string;
  onChange: (value: Date | null) => void;
};

export default function DatePicker({
  label,
  placeholder,
  date,
  autoFocus,
  isInvalid,
  helperText,
  onChange,
}: DatePickerProps) {
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
        ></TextField>
      )}
    ></MuiDatePicker>
  );
}
