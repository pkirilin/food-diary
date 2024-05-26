import { type noteModel, type CreateNoteRequest, type EditNoteRequest } from '@/entities/note';
import { type productModel, type ProductSelectOption } from '@/entities/product';
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

export const mapToFormData = ({
  mealType,
  pageId,
  product,
  productQuantity,
  displayOrder,
}: Note): FormData => {
  const formData = new FormData();
  formData.append('mealType', mealType.toString());
  formData.append('pageId', pageId.toString());
  formData.append('productQuantity', productQuantity.toString());
  formData.append('displayOrder', displayOrder.toString());

  if (product.freeSolo) {
    formData.append('productCaloriesCost', product.caloriesCost.toString());
    formData.append('productCategoryId', product.category?.id.toString() ?? '');
    formData.append('productCategoryName', product.category?.name ?? '');
  } else {
    formData.append('productId', product.id.toString());
  }

  formData.append('productName', product.name);
  formData.append('productDefaultQuantity', product.defaultQuantity.toString());
  return formData;
};

const mapProductFromFormData = (formData: FormData): productModel.AutocompleteOption => {
  const id = formData.get('productId')?.toString() ?? null;
  const name = formData.get('productName')?.toString() ?? '';
  const caloriesCost = formData.get('productCaloriesCost')?.toString() ?? null;
  const defaultQuantity = Number(formData.get('productDefaultQuantity'));
  const categoryId = formData.get('productCategoryId')?.toString() ?? null;
  const categoryName = formData.get('productCategoryName')?.toString() ?? '';

  return id && !caloriesCost && !categoryId
    ? {
        id: Number(id),
        name,
        defaultQuantity,
      }
    : {
        freeSolo: true,
        editing: true,
        name,
        defaultQuantity,
        caloriesCost: Number(caloriesCost),
        category: {
          id: Number(categoryId),
          name: categoryName,
        },
      };
};

export const mapNoteFromFormData = (formData: FormData): Note => {
  const mealType = Number(formData.get('mealType'));
  const pageId = Number(formData.get('pageId'));
  const productQuantity = Number(formData.get('productQuantity'));
  const displayOrder = Number(formData.get('displayOrder'));
  const product = mapProductFromFormData(formData);

  return { mealType, pageId, product, productQuantity, displayOrder };
};
