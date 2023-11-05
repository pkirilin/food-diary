import { TextFieldProps } from '@mui/material';
import createInputHook from './createInputHook';
import createValidatedInputHook from './createValidatedInputHook';

export const useTextInput = createInputHook<string, TextFieldProps>((value, setValue) => ({
  value,
  onChange: event => {
    setValue(event.target.value);
  },
}));

export const useValidatedTextInput = createValidatedInputHook<string, TextFieldProps>(useTextInput);
