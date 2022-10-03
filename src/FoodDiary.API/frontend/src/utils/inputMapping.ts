import { TextFieldProps } from '@mui/material';
import { DatePickerProps } from 'src/components/DatePicker';
import { MapToInputPropsFunction } from 'src/types';

export const mapToTextInputProps: MapToInputPropsFunction<string, TextFieldProps> = ({
  value,
  setValue,
  isInvalid,
  helperText,
}) => ({
  value,
  error: isInvalid,
  helperText,
  onChange: event => {
    setValue(event.target.value);
  },
});

export const mapToNumericInputProps: MapToInputPropsFunction<number, TextFieldProps> = ({
  value,
  setValue,
  isInvalid,
  helperText,
}) => ({
  value,
  error: isInvalid,
  helperText,
  onChange: event => {
    setValue(event.target.value ? Number(event.target.value) : 0);
  },
});

export const mapToDateInputProps: MapToInputPropsFunction<Date | null, DatePickerProps> = ({
  value,
  setValue,
  isInvalid,
  helperText,
}) => ({
  date: value,
  isInvalid,
  helperText,
  onChange: newValue => {
    setValue(newValue);
  },
});
