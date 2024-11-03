import { z } from 'zod';
import { noteModel } from '@/entities/note';
import { quantitySchema } from './quantitySchema';

export const noteSchema = z.object({
  date: z.string(),
  mealType: z.nativeEnum(noteModel.MealType),
  displayOrder: z.coerce.number().int().min(0),
  product: z
    .object({
      id: z.number(),
      name: z.string(),
      defaultQuantity: quantitySchema,
    })
    .nullable()
    .refine(product => product !== null, { message: 'Product is required' }),
  quantity: quantitySchema,
});

export type NoteFormValues = z.infer<typeof noteSchema>;
