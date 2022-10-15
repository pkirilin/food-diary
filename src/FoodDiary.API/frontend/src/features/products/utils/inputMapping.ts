import { MapToInputPropsFunction } from 'src/types';
import { ProductSelectProps } from '../components/ProductSelect';
import { ProductSelectOption } from '../types';

export const mapToProductSelectProps: MapToInputPropsFunction<
  ProductSelectOption | null,
  ProductSelectProps
> = ({ value, setValue, helperText, isInvalid }) => ({
  value,
  setValue,
  helperText,
  isInvalid,
});
