import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(3).max(100),
  caloriesCost: z.coerce.number().int().min(1).max(4999),
  defaultQuantity: z.coerce.number().int().min(1).max(999),
  category: z
    .object({
      id: z.number(),
      name: z.string().min(3).max(50),
    })
    .nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
