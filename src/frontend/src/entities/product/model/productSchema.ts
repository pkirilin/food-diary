import { z } from 'zod';
import { quantitySchema } from '@/shared/lib';

// TODO: add tests
const nutrientQuantitySchema = z
  .string()
  .or(z.number())
  .transform(value => String(value).trim())
  .refine(value => /^\d+([.,]\d+)?$/.test(value), {
    message: "Must be a valid number with either '.' or ',' as decimal separator",
  })
  .transform(value => Number(value.replace(',', '.')))
  .pipe(z.coerce.number().min(0).max(1000).nullable())
  .refine(value => value !== null && !isNaN(value), { message: 'Must be a valid number' });

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3).max(100),
  defaultQuantity: quantitySchema,
  caloriesCost: z.coerce.number().int().min(1).max(1000),
  category: z
    .object({
      id: z.number(),
      name: z.string().min(3).max(50),
    })
    .nullable()
    .refine(category => category !== null, { message: 'Category is required' }),
  protein: nutrientQuantitySchema,
});

export type ProductFormValues = z.infer<typeof productSchema>;
