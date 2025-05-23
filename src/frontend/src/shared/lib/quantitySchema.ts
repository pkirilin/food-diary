import { z } from 'zod';

export const quantitySchema = z.coerce.number().int().min(10).max(1000);
