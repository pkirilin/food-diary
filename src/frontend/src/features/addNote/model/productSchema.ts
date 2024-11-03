import { z } from 'zod';
import { quantitySchema } from './quantitySchema';

export const productSchema = z.object({
  name: z.string().min(3).max(100),
  caloriesCost: z.coerce.number().int().min(1).max(4999),
  defaultQuantity: quantitySchema,
  category: z
    .object({
      id: z.number(),
      name: z.string().min(3).max(50),
    })
    .nullable()
    .refine(category => category !== null, { message: 'Category is required' }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
