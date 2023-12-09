import { type NoteCreateEdit } from 'src/features/notes';
import { db, type DbNote, type DbProduct } from '../db';

type Result = 'Success' | 'PageNotFound' | 'ProductNotFound';

export const get = (pageId: number, mealType: number | null): DbNote[] =>
  db.note.findMany({
    where: {
      pageId: { equals: pageId },
      mealType: mealType === null ? {} : { equals: mealType },
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

export const calculateCalories = (quantity: number, product: DbProduct): number =>
  Math.floor((quantity * product.caloriesCost) / 100);

export const create = ({
  mealType,
  productQuantity,
  displayOrder,
  productId,
  pageId,
}: NoteCreateEdit): Result => {
  const page = db.page.findFirst({
    where: {
      id: { equals: pageId },
    },
  });

  if (!page) {
    return 'PageNotFound';
  }

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
    pageId,
  });

  return 'Success';
};

export const update = (
  id: number,
  { mealType, productQuantity, displayOrder, productId, pageId }: NoteCreateEdit,
): Result => {
  const page = db.page.findFirst({
    where: {
      id: { equals: pageId },
    },
  });

  if (!page) {
    return 'PageNotFound';
  }

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
      quantity: productQuantity,
      displayOrder,
      productId,
      pageId,
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
