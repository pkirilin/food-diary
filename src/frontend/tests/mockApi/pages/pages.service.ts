import { SortOrder } from 'src/types';
import { db } from '../db';

type GetPagesParams = {
  pageNumber: number;
  pageSize: number;
  sortOrder: SortOrder;
};

export const get = ({ pageNumber, pageSize, sortOrder }: GetPagesParams) =>
  db.page.findMany({
    orderBy: {
      date: sortOrder === SortOrder.Ascending ? 'asc' : 'desc',
    },
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

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
