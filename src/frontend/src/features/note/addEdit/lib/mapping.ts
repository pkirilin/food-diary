import { type noteModel, type CreateNoteRequest, type EditNoteRequest } from '@/entities/note';
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
  { mealType, pageId, productQuantity, displayOrder }: Note,
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
  { mealType, pageId, productQuantity, displayOrder }: Note,
): EditNoteRequest => ({
  id,
  mealType,
  productId,
  pageId,
  productQuantity,
  displayOrder,
});
