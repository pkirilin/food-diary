import { CategoryAutocompleteOption } from 'src/features/categories';
import { MapToInputPropsFunction } from 'src/types';
import { CategorySelectProps } from '../components/CategorySelect';

export const mapToCategorySelectProps: MapToInputPropsFunction<
  CategoryAutocompleteOption | null,
  CategorySelectProps
> = ({ value, setValue }) => ({
  value,
  setValue,
});
