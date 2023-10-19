import { CategoryFormData } from 'src/features/categories';
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

export const create = ({ name }: CategoryFormData) => {
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

export const update = (id: number, body: CategoryFormData) => {
  db.category.update({
    where: {
      id: { equals: id },
    },
    data: body,
  });
};

export const deleteOne = (id: number) => {
  db.product.deleteMany({
    where: {
      category: {
        id: { equals: id },
      },
    },
  });

  db.category.delete({
    where: {
      id: { equals: id },
    },
  });
};
