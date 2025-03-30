import { type GetProductByIdResponse } from '@/entities/product';
import { type ProductFormValues } from '../model';

export const toProductFormValues = (
  { name, defaultQuantity, caloriesCost, category }: GetProductByIdResponse,
  productId: number,
): ProductFormValues => ({
  id: productId,
  name,
  defaultQuantity,
  caloriesCost,
  category: {
    id: category.id,
    name: category.name,
  },
});
