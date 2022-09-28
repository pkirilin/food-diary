import { TextFieldProps } from '@mui/material';
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
