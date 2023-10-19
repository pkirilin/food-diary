import { db } from '../db';

export const getByPageId = (pageId: number) =>
  db.note.findMany({
    where: {
      pageId: { equals: pageId },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });
