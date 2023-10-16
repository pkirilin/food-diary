import { db } from '../db';

type GetProductsRequest = {
  pageNumber: number;
  pageSize: number;
  categoryId: string | null;
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
      //   categoryId: categoryId ? { equals: Number(categoryId) } : {},
      //   categoryId: {},
    },

    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  if (productSearchName) {
    productItems = productItems.filter(p => p.name.toLowerCase().startsWith(productSearchName));
  }

  const totalProductsCount = db.product.count();

  return db.product.getAll();
};

export const count = (): number => db.product.count();
