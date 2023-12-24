import { type ProductSelectOption } from '../products';
import { type NoteItem } from './models';

export const toProductSelectOption = ({
  productId,
  productName,
  productDefaultQuantity,
}: NoteItem): ProductSelectOption => ({
  id: productId,
  name: productName,
  defaultQuantity: productDefaultQuantity,
});
