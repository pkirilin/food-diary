import { type CategoryFormData } from 'src/features/categories';
import { type DbCategory, db } from '../db';

export const getAll = (): DbCategory[] =>
  db.category.findMany({
    orderBy: { name: 'asc' },
  });

export const getProductsCount = (categoryId: number): number =>
  db.product.count({
    where: {
      categoryId: { equals: categoryId },
    },
  });

export const create = ({ name }: CategoryFormData): void => {
  const maxId =
    db.category
      .findMany({
        orderBy: {
          id: 'desc',
        },
        take: 1,
      })
      ?.at(0)?.id ?? 0;

  db.category.create({
    id: maxId + 1,
    name,
  });
};

export const update = (id: number, body: CategoryFormData): void => {
  db.category.update({
    where: {
      id: { equals: id },
    },
    data: body,
  });
};

export const deleteOne = (id: number): void => {
  const products = db.product.findMany({
    where: {
      categoryId: { equals: id },
    },
  });

  db.note.deleteMany({
    where: {
      productId: { in: products.map(p => p.id) },
    },
  });

  db.product.deleteMany({
    where: {
      categoryId: { equals: id },
    },
  });

  db.category.delete({
    where: {
      id: { equals: id },
    },
  });
};
