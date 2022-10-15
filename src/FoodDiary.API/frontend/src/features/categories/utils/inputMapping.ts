import { MapToInputPropsFunction, SelectOption } from 'src/types';
import { CategorySelectProps } from '../components/CategorySelect';

export const mapToCategorySelectProps: MapToInputPropsFunction<
  SelectOption | null,
  CategorySelectProps
> = ({ value, setValue, helperText, isInvalid }) => ({
  value,
  setValue,
  helperText,
  isInvalid,
});
