import { z } from 'zod';
import { quantitySchema } from '@/shared/lib';
import { NutritionValueSchema } from './NutritionValueSchema';

export const productNameSchema = z
  .string()
  .trim()
  .refine(name => name.length >= 3 && name.length <= 100, {
    error: 'Product name must be between 3 and 100 characters',
  });

export const productSchema = z.object({
  id: z.number().optional(),
  name: productNameSchema,
  defaultQuantity: quantitySchema,
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .refine((category): boolean => category !== null, { error: 'Category is required' }),
  calories: z.coerce.number<number>().int().min(1).max(1000),
  protein: NutritionValueSchema,
  fats: NutritionValueSchema,
  carbs: NutritionValueSchema,
  sugar: NutritionValueSchema,
  salt: NutritionValueSchema,
});

export type ProductFormValues = z.infer<typeof productSchema>;
