import { type UpdateNoteRequest, type NoteItem, type NoteRequestBody } from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';
import { type Note } from '../model';

export const mapToProductSelectOption = ({
  productId,
  productName,
  productDefaultQuantity,
}: NoteItem): ProductSelectOption => ({
  id: productId,
  name: productName,
  defaultQuantity: productDefaultQuantity,
});

export const mapToNoteRequestBody = (
  { date, mealType, productQuantity, displayOrder }: Note,
  productId: number,
): NoteRequestBody => ({
  date,
  mealType,
  productId,
  productQuantity,
  displayOrder,
});

export const mapToUpdateNoteRequest = (
  id: number,
  productId: number,
  note: Note,
): UpdateNoteRequest => ({
  id,
  note: mapToNoteRequestBody(note, productId),
});
