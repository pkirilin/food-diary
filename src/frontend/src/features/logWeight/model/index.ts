import { z } from 'zod';
import { weightSchema } from './weightSchema';

export const schema = z.object({
  date: z.date(),
  weight: weightSchema,
});

export type FormValues = z.infer<typeof schema>;
