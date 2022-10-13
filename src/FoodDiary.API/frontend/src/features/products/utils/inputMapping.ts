import { MapToInputPropsFunction } from 'src/types';
import { ProductSelectProps } from '../components/ProductSelect';
import { ProductAutocompleteOption } from '../types';

export const mapToProductSelectProps: MapToInputPropsFunction<
  ProductAutocompleteOption | null,
  ProductSelectProps
> = ({ value, setValue }) => ({
  value,
  setValue,
});
