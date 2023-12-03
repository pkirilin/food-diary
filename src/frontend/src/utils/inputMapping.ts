import { type TextFieldProps } from '@mui/material';
import { type DatePickerProps } from 'src/components/DatePicker';
import { type MapToInputPropsFunction, type SelectOption, type SelectProps } from 'src/types';

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

export const mapToSelectProps: MapToInputPropsFunction<
  SelectOption | null,
  SelectProps<SelectOption>
> = ({ value, setValue, helperText, isInvalid }) => ({
  value,
  setValue,
  helperText,
  isInvalid,
});
