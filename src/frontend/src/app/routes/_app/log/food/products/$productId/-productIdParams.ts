import { z } from 'zod';

export const productIdParams = {
  parse: ({ productId }: { productId: string }) => ({
    productId: z.coerce.number<string>().int().positive().parse(productId),
  }),
  stringify: ({ productId }: { productId: number }) => ({ productId: String(productId) }),
};
