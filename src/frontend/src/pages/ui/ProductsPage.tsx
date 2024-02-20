import { type FC } from 'react';
import { ok, withAuthStatusCheck } from '../lib';
import { Products, productsApi, toGetProductsRequest } from '@/features/products';
import store from '@/store';
import { PrivateLayout } from '@/widgets/layout';

export const loader = withAuthStatusCheck(async () => {
  const getProductsRequest = toGetProductsRequest(store.getState().products.filter);
  await store.dispatch(productsApi.endpoints.getProducts.initiate(getProductsRequest));
  return ok();
});

export const Component: FC = () => (
  <PrivateLayout>
    <Products />
  </PrivateLayout>
);
