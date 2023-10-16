import { drop } from '@mswjs/data';
import data from './data.json';
import { db } from './db';

export const initDb = (): void => {
  drop(db);

  for (const { notes, ...page } of data.pages) {
    for (const { product, ...note } of notes) {
      const { category } = product;

      let dbCategory = db.category.findFirst({
        where: {
          id: { equals: category.id },
        },
      });

      if (!dbCategory) {
        dbCategory = db.category.create(category);
      }

      let dbProduct = db.product.findFirst({
        where: {
          id: { equals: product.id },
        },
      });

      if (!dbProduct) {
        dbProduct = db.product.create({
          ...product,
          category: dbCategory,
        });
      }

      db.note.create({
        ...note,
        product: dbProduct,
      });
    }

    const dbNotes = db.note.findMany({
      where: {
        pageId: { equals: page.id },
      },
    });

    db.page.create({
      ...page,
      notes: dbNotes,
    });
  }
};
