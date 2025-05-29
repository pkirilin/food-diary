import { z } from 'zod';

export const NutritionComponentQuantitySchema = z
  .union([z.string(), z.number(), z.null()])
  .transform(value => (value === null ? '' : String(value).trim()))
  .refine(value => value === '' || /^\d+([.,]\d{1,2})?$/.test(value), {
    message: 'Must be a valid number with up to 2 decimal places',
  })
  .transform(value => {
    if (value === '') {
      return null;
    }
    const normalized = value.replace(',', '.');
    const num = Number(normalized);
    return isNaN(num) ? null : num;
  })
  .pipe(z.number().min(0).max(1000).nullable());
