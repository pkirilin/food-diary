import { CategoryAutocompleteOption } from 'src/features/categories';
// eslint-disable-next-line no-restricted-imports
import { CategorySelectProps } from 'src/features/products/components/CategorySelect';
import { MapToInputPropsFunction } from 'src/types';

export const mapToCategorySelectProps: MapToInputPropsFunction<
  CategoryAutocompleteOption | null,
  CategorySelectProps
> = ({ value, setValue }) => ({
  value,
  setValue,
});
