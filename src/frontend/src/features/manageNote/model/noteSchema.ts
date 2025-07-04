import { z } from 'zod';
import { noteModel } from '@/entities/note';
import { quantitySchema } from '@/shared/lib';

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  defaultQuantity: quantitySchema,
  calories: z.number(),
  protein: z.number().nullable(),
  fats: z.number().nullable(),
  carbs: z.number().nullable(),
  sugar: z.number().nullable(),
  salt: z.number().nullable(),
});

export const noteSchema = z.object({
  id: z.number().optional(),
  date: z.string(),
  mealType: z.nativeEnum(noteModel.MealType),
  displayOrder: z.coerce.number().int().min(0),
  product: productSchema
    .nullable()
    .refine(product => product !== null, { message: 'Product is required' }),
  quantity: quantitySchema,
});

export type NoteFormValues = z.infer<typeof noteSchema>;
export type NoteFormValuesProduct = z.infer<typeof productSchema>;
