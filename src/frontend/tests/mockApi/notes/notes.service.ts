import { type NoteRequestBody, type UpdateNoteRequest } from '@/entities/note';
import { db, type DbNote, type DbProduct } from '../db';

type Result = 'Success' | 'ProductNotFound';

export const get = (date: string, mealType: number | null): DbNote[] =>
  db.note.findMany({
    where: {
      date: { equals: date },
      mealType: mealType === null ? {} : { equals: mealType },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

export const getByDate = (date: string): DbNote[] =>
  db.note.findMany({
    where: {
      date: { equals: date },
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

export const getHistory = (from: string, to: string): Map<string, DbNote[]> =>
  db.note
    .findMany({
      where: {
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })
    .reduce((groups, note) => {
      const group = groups.get(note.date);
      if (group) {
        group.push(note);
      } else {
        groups.set(note.date, [note]);
      }
      return groups;
    }, new Map<string, DbNote[]>());

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

export const calculateCalories = (quantity: number, caloriesCost: number): number =>
  Math.floor((quantity * caloriesCost) / 100);

export const create = ({
  mealType,
  productQuantity,
  displayOrder,
  productId,
}: NoteRequestBody): Result => {
  const product = db.product.findFirst({
    where: {
      id: { equals: productId },
    },
  });

  if (!product) {
    return 'ProductNotFound';
  }

  const maxId =
    db.note
      .findMany({
        orderBy: { id: 'desc' },
        take: 1,
      })
      .at(0)?.id ?? 0;

  db.note.create({
    id: maxId + 1,
    mealType,
    quantity: productQuantity,
    displayOrder,
    productId,
  });

  return 'Success';
};

export const update = ({ id, note }: UpdateNoteRequest): Result => {
  const { mealType, productQuantity: quantity, displayOrder, productId } = note;

  const product = db.product.findFirst({
    where: {
      id: { equals: productId },
    },
  });

  if (!product) {
    return 'ProductNotFound';
  }

  db.note.update({
    where: {
      id: { equals: id },
    },
    data: {
      mealType,
      quantity,
      displayOrder,
      productId,
    },
  });

  return 'Success';
};

export const deleteOne = (id: number): void => {
  db.note.delete({
    where: {
      id: { equals: id },
    },
  });
};
