import { db } from '../db';

export const getAll = () => db.category.getAll();

export const getProductsCount = (categoryId: number) =>
  db.product.count({
    where: {
      category: {
        id: { equals: categoryId },
      },
    },
  });
