import { z } from 'zod';
import { quantitySchema } from '@/shared/lib';
import { NutritionValueSchema } from './NutritionValueSchema';

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3).max(100),
  defaultQuantity: quantitySchema,
  category: z
    .object({
      id: z.number(),
      name: z.string().min(3).max(50),
    })
    .nullable()
    .refine(category => category !== null, { message: 'Category is required' }),
  calories: z.coerce.number().int().min(1).max(1000),
  protein: NutritionValueSchema,
  fats: NutritionValueSchema,
  carbs: NutritionValueSchema,
  sugar: NutritionValueSchema,
  salt: NutritionValueSchema,
});

export type ProductFormValues = z.infer<typeof productSchema>;
