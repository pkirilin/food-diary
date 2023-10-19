import { CreateProductRequest, EditProductRequest } from 'src/features/products';
import { db } from '../db';

type GetProductsRequest = {
  pageNumber: number;
  pageSize: number;
  categoryId: number | null;
  productSearchName: string | null;
};

export const get = ({
  pageNumber,
  pageSize,
  categoryId,
  productSearchName,
}: GetProductsRequest) => {
  let productItems = db.product.findMany({
    where: {
      category: {
        id: categoryId === null ? {} : { equals: categoryId },
      },
    },
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  if (productSearchName) {
    productItems = productItems.filter(p => p.name.toLowerCase().startsWith(productSearchName));
  }

  return productItems;
};

export const getAll = () => db.product.getAll();

export const count = (): number => db.product.count();

type CreateProductResult = 'Success' | 'CategoryNotFound';

export const create = ({
  name,
  caloriesCost,
  categoryId,
}: CreateProductRequest): CreateProductResult => {
  const category = db.category.findFirst({
    where: {
      id: { equals: categoryId },
    },
  });

  if (!category) {
    return 'CategoryNotFound';
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

  db.product.create({
    id: maxId + 1,
    name,
    caloriesCost,
    category,
  });

  return 'Success';
};

type UpdateProductResult = 'Success' | 'CategoryNotFound';

export const update = (
  id: number,
  { name, caloriesCost, categoryId }: EditProductRequest,
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
      category,
    },
  });

  return 'Success';
};

export const deleteMany = (ids: number[]) => {
  db.product.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};
