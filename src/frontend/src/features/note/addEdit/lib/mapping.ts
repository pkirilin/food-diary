import { type noteModel, type CreateNoteRequest, type UpdateNoteRequest } from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';
import { type Note } from '../model';

export const mapToProductSelectOption = ({
  productId,
  productName,
  productDefaultQuantity,
}: noteModel.NoteItem): ProductSelectOption => ({
  id: productId,
  name: productName,
  defaultQuantity: productDefaultQuantity,
});

export const mapToCreateNoteRequest = (
  { date, mealType, productQuantity, displayOrder }: Note,
  productId: number,
): CreateNoteRequest => ({
  date,
  mealType,
  productId,
  productQuantity,
  displayOrder,
});

export const mapToEditNoteRequest = (
  id: number,
  productId: number,
  { date, mealType, productQuantity, displayOrder }: Note,
): UpdateNoteRequest => ({
  id,
  date,
  mealType,
  productId,
  productQuantity,
  displayOrder,
});
