import { z } from 'zod';

export const weightSchema = z
  .string()
  .or(z.number())
  .transform(value => String(value).trim())
  .refine(value => /^\d+([.,]\d+)?$/.test(value), {
    message: "Must be a valid number with either '.' or ',' as decimal separator",
  })
  .transform(value => Number(value.replace(',', '.')))
  .pipe(z.coerce.number().gte(1).lte(500))
  .refine(value => !isNaN(value), { message: 'Must be a valid number' });
