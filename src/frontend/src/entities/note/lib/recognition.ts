import { type productModel } from '@/entities/product';
import { type imageLib } from '@/shared/lib';
import { type SelectOption } from '@/shared/types';
import { type RecognizeNoteItem } from '../api';

const toBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const type = /^data:([^;]*)/.exec(header)?.[1] ?? '';
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  return new Blob([bytes], { type });
};

export const toRecognizeFormData = (images: imageLib.Image[]): FormData => {
  const formData = new FormData();

  for (const { base64, name } of images) {
    formData.append('files', toBlob(base64), name);
  }

  return formData;
};

export const toRecognizedProductFormValues = (
  { product, quantity }: RecognizeNoteItem,
  category: SelectOption | null,
): productModel.ProductFormValues => ({
  name: product.name.trim(),
  defaultQuantity: quantity,
  category,
  calories: product.caloriesCost,
  protein: product.protein,
  fats: product.fats,
  carbs: product.carbs,
  sugar: product.sugar,
  salt: product.salt,
});
