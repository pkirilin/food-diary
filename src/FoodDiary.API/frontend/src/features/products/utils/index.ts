import { Product, ProductFormData } from '../types';

export function toProductFormData({
  name,
  caloriesCost,
  categoryId,
  categoryName,
}: Product): ProductFormData {
  return {
    name,
    caloriesCost,
    category: {
      id: categoryId,
      name: categoryName,
    },
  };
}
