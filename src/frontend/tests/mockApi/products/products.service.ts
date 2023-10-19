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
