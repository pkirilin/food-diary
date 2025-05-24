import { type CreateProductRequest, type EditProductRequest } from '@/entities/product';
import { db, type DbProduct } from '../db';

interface GetProductsRequest {
  pageNumber: number;
  pageSize: number;
  categoryId: number | null;
  productSearchName: string | null;
}

export const get = ({
  pageNumber,
  pageSize,
  categoryId,
  productSearchName,
}: GetProductsRequest): DbProduct[] => {
  let productItems = db.product.findMany({
    where: {
      categoryId: categoryId === null ? {} : { equals: categoryId },
    },
    orderBy: { name: 'asc' },
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  if (productSearchName) {
    productItems = productItems.filter(p => p.name.toLowerCase().startsWith(productSearchName));
  }

  return productItems;
};

export const getById = (id: number): DbProduct | null =>
  db.product.findFirst({
    where: {
      id: { equals: id },
    },
  });

export const getAll = (): DbProduct[] => db.product.getAll();

export const getCategoryNames = (products: DbProduct[]): Map<number, string> => {
  return products
    .map(p => p.categoryId)
    .reduce((map, id) => {
      if (map.has(id)) {
        return map;
      }

      const category = db.category.findFirst({
        where: {
          id: { equals: id },
        },
      });

      if (category) {
        map.set(id, category.name);
      }

      return map;
    }, new Map<number, string>());
};

export const count = (): number => db.product.count();

interface CreateProductResultSuccess {
  type: 'Success';
  id: number;
}
interface CreateProductResultError {
  type: 'CategoryNotFound';
}

type CreateProductResult = CreateProductResultSuccess | CreateProductResultError;

export const create = ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
}: CreateProductRequest): CreateProductResult => {
  const category = db.category.findFirst({
    where: {
      id: { equals: categoryId },
    },
  });

  if (!category) {
    return { type: 'CategoryNotFound' };
  }

  const maxId =
    db.product
      .findMany({
        orderBy: {
          id: 'desc',
        },
        take: 1,
      })
      ?.at(0)?.id ?? 0;

  const id = maxId + 1;

  // TODO: show error when property is missing
  db.product.create({
    id,
    name,
    caloriesCost,
    defaultQuantity,
    categoryId,
    protein,
  });

  return { type: 'Success', id };
};

type UpdateProductResult = 'Success' | 'CategoryNotFound';

export const update = (
  id: number,
  { name, caloriesCost, defaultQuantity, categoryId, protein }: EditProductRequest,
): UpdateProductResult => {
  const category = db.category.findFirst({
    where: {
      id: { equals: categoryId },
    },
  });

  if (!category) {
    return 'CategoryNotFound';
  }

  db.product.update({
    where: {
      id: { equals: id },
    },
    // TODO: show error when property is missing
    data: {
      name,
      caloriesCost,
      defaultQuantity,
      categoryId,
      protein,
    },
  });

  return 'Success';
};

export const deleteMany = (ids: number[]): void => {
  db.note.deleteMany({
    where: {
      productId: { in: ids },
    },
  });

  db.product.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};
