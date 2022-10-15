import { MapToInputPropsFunction, SelectOption } from 'src/types';
import { ProductSelectProps } from '../components/ProductSelect';

export const mapToProductSelectProps: MapToInputPropsFunction<
  SelectOption | null,
  ProductSelectProps
> = ({ value, setValue, helperText, isInvalid }) => ({
  value,
  setValue,
  helperText,
  isInvalid,
});
