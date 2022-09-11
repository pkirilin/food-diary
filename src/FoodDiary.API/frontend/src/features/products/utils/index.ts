import { ProductItem } from '../models';
import { ProductFormData } from '../types';

export function toProductFormData({
  name,
  caloriesCost,
  categoryId,
  categoryName,
}: ProductItem): ProductFormData {
  return {
    name,
    caloriesCost,
    category: {
      id: categoryId,
      name: categoryName,
    },
  };
}
