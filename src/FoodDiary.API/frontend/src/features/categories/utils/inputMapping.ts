import { CategorySelectOption } from 'src/features/categories';
import { MapToInputPropsFunction } from 'src/types';
import { CategorySelectProps } from '../components/CategorySelect';

export const mapToCategorySelectProps: MapToInputPropsFunction<
  CategorySelectOption | null,
  CategorySelectProps
> = ({ value, setValue, helperText, isInvalid }) => ({
  value,
  setValue,
  helperText,
  isInvalid,
});
