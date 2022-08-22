import { rest } from 'msw';
import { API_URL } from 'src/config';
import { ProductsResponse } from 'src/features/products';
import { ProductCreateEdit } from 'src/features/products/models';
import { db } from '../db';

export const productsHandlers = [
  rest.get(`${API_URL}/api/v1/products`, (req, res, ctx) => {
    const pageNumber = Number(req.url.searchParams.get('pageNumber'));
    const pageSize = Number(req.url.searchParams.get('pageSize'));
    const productItems = db.product.getAll().slice(pageNumber - 1, pageSize);

    const response: ProductsResponse = {
      productItems,
      totalProductsCount: 100,
    };

    return res(ctx.json(response));
  }),

  rest.post(`${API_URL}/v1/products`, async (req, res, ctx) => {
    const body = await req.json<ProductCreateEdit>();

    const category = db.category.findFirst({
      where: {
        id: {
          equals: body.categoryId,
        },
      },
    });

    db.product.create({
      ...body,
      id: 5,
      categoryName: category?.name,
    });

    return res(ctx.status(200));
  }),

  rest.put(`${API_URL}/v1/products/:id`, async (req, res, ctx) => {
    const { name, caloriesCost, categoryId } = await req.json<ProductCreateEdit>();

    db.product.update({
      where: {
        id: {
          equals: +req.params['id'],
        },
      },

      data: {
        name,
        caloriesCost,
        categoryId,
      },
    });

    return res(ctx.status(200));
  }),

  rest.delete(`${API_URL}/v1/products/batch`, async (req, res, ctx) => {
    const productIds = await req.json<number[]>();

    db.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    return res(ctx.status(200));
  }),
];
