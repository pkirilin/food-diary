import { type FC } from 'react';
import { type LoaderFunction } from 'react-router';
import { store } from '@/app/store';
import { productApi, productLib } from '@/entities/product';
import { Products } from '@/features/products';
import { PageContainer } from '@/shared/ui';
import { ok } from '../lib';

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

export const Component: FC = () => (
  <PageContainer>
    <Products />
  </PageContainer>
);
