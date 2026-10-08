import { type FC } from 'react';
import { type LoaderFunction } from 'react-router';
import { productApi, productLib } from '@/entities/product';
import { ProductsPage } from '@/pages/ui/ProductsPage';
import { store } from '../store';
import { ok } from './reactRouterExtensions';

export const loader: LoaderFunction = async () => {
  const request = productLib.mapToGetProductsRequest(store.getState().products.filter);
  const productsQueryPromise = store.dispatch(productApi.endpoints.getProducts.initiate(request));

  try {
    await productsQueryPromise;
    return ok();
  } finally {
    productsQueryPromise.unsubscribe();
  }
};

export const Component: FC = () => <ProductsPage />;
