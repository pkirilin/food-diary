import { db, DbNote, DbProduct } from '../db';

export const getByPageId = (pageId: number) =>
  db.note.findMany({
    where: {
      pageId: { equals: pageId },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

export const getProducts = (notes: DbNote[]): Map<number, DbProduct> => {
  return notes
    .map(n => n.productId)
    .reduce((map, id) => {
      if (map.has(id)) {
        return map;
      }

      const product = db.product.findFirst({
        where: {
          id: { equals: id },
        },
      });

      if (product) {
        map.set(id, product);
      }

      return map;
    }, new Map<number, DbProduct>());
};
