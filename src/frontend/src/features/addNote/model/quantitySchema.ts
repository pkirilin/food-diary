import { z } from 'zod';

export const quantitySchema = z.coerce.number().int().min(1).max(999);
