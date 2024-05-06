import {
  type noteModel,
  type NoteCreateEdit,
  type CreateNoteRequest,
  type EditNoteRequest,
} from '@/entities/note';
import { type ProductSelectOption } from '@/entities/product';

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
  { mealType, pageId, productQuantity, displayOrder }: NoteCreateEdit,
  productId: number,
): CreateNoteRequest => ({
  mealType,
  productId,
  pageId,
  productQuantity,
  displayOrder,
});

export const mapToEditNoteRequest = (
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
