import { type CreateProductRequest, type EditProductRequest } from 'src/features/products';
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

  db.product.create({
    id,
    name,
    caloriesCost,
    defaultQuantity,
    categoryId,
  });

  return { type: 'Success', id };
};

type UpdateProductResult = 'Success' | 'CategoryNotFound';

export const update = (
  id: number,
  { name, caloriesCost, defaultQuantity, categoryId }: EditProductRequest,
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
    data: {
      name,
      caloriesCost,
      defaultQuantity,
      categoryId,
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
