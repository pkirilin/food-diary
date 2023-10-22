import { NumberQuery } from '@mswjs/data/lib/query/queryTypes';
import { GetPagesRequest, PageCreateEdit } from 'src/features/pages';
import { SortOrder } from 'src/types';
import { db, DbNote, DbProduct } from '../db';

const buildQuery = (startDate: string | null, endDate: string | null): Partial<NumberQuery> => {
  if (startDate && endDate) {
    return { between: [Date.parse(startDate), Date.parse(endDate)] };
  }

  if (startDate) {
    return { gte: Date.parse(startDate) };
  }

  if (endDate) {
    return { lte: Date.parse(endDate) };
  }

  return {};
};

export const get = ({ pageNumber, pageSize, sortOrder, startDate, endDate }: GetPagesRequest) => {
  const query = buildQuery(startDate, endDate);

  return db.page.findMany({
    where: { date: query },
    orderBy: {
      date: sortOrder === SortOrder.Ascending ? 'asc' : 'desc',
    },
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });
};

export const count = () => db.page.count();

export const getById = (id: number) =>
  db.page.findFirst({
    where: {
      id: { equals: id },
    },
  });

export const getPrevious = (id: number) =>
  db.page.findFirst({
    where: {
      id: { lt: id },
    },
  });

export const getNext = (id: number) =>
  db.page.findFirst({
    where: {
      id: { gt: id },
    },
  });

export const getNotes = (pageId: number): DbNote[] => {
  const notes = db.note.findMany({
    where: {
      pageId: { equals: pageId },
    },
  });

  const compareNotes = (first: DbNote, second: DbNote) => {
    const pageIdDiff = first.pageId - second.pageId;
    return pageIdDiff === 0 ? first.displayOrder - second.displayOrder : pageIdDiff;
  };

  return notes.sort(compareNotes);
};

export const getNewPageDate = (): Date => {
  const lastDatePage = db.page
    .findMany({
      orderBy: {
        date: 'desc',
      },
      take: 1,
    })
    .at(0);

  if (!lastDatePage) {
    return new Date();
  }

  const nextDayDate = new Date(lastDatePage.date + 86400000);
  return nextDayDate;
};

export const calculateCalories = (notes: DbNote[]): number => {
  const productsMap = notes
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

  const countCalories = notes.reduce((count, { quantity, productId }) => {
    const product = productsMap.get(productId);
    return product ? count + (quantity * product.caloriesCost) / 100 : count;
  }, 0);

  return Math.floor(countCalories);
};

export const create = ({ date }: PageCreateEdit): void => {
  const maxId =
    db.page
      .findMany({
        orderBy: { id: 'desc' },
        take: 1,
      })
      .at(0)?.id ?? 0;

  db.page.create({
    id: maxId + 1,
    date: Date.parse(date),
  });
};

export const update = (id: number, { date }: PageCreateEdit) => {
  db.page.update({
    where: {
      id: { equals: id },
    },
    data: {
      date: Date.parse(date),
    },
  });
};

export const deleteMany = (pageIds: number[]) => {
  db.note.deleteMany({
    where: {
      pageId: { in: pageIds },
    },
  });

  db.page.deleteMany({
    where: {
      id: { in: pageIds },
    },
  });
};
