import { type ProductSelectOption } from '../products';
import { type EditNoteRequest, type CreateNoteRequest } from './api';
import { type NoteCreateEdit, type NoteItem } from './models';

export const toProductSelectOption = ({
  productId,
  productName,
  productDefaultQuantity,
}: NoteItem): ProductSelectOption => ({
  id: productId,
  name: productName,
  defaultQuantity: productDefaultQuantity,
});

export const toCreateNoteRequest = (
  { mealType, pageId, productQuantity, displayOrder }: NoteCreateEdit,
  productId: number,
): CreateNoteRequest => ({
  mealType,
  productId,
  pageId,
  productQuantity,
  displayOrder,
});

export const toEditNoteRequest = (
  id: number,
  productId: number,
  { mealType, pageId, productQuantity, displayOrder }: NoteCreateEdit,
): EditNoteRequest => ({
  id,
  mealType,
  productId,
  pageId,
  productQuantity,
  displayOrder,
});
