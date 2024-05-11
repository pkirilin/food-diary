import { type FC } from 'react';
import { store } from '@/app/store';
import { productApi, productLib } from '@/entities/product';
import { Products } from '@/features/products';
import { PrivateLayout } from '@/widgets/layout';
import { ok, withAuthStatusCheck } from '../lib';

export const loader = withAuthStatusCheck(async () => {
  const getProductsRequest = productLib.mapToGetProductsRequest(store.getState().products.filter);
  await store.dispatch(productApi.endpoints.getProducts.initiate(getProductsRequest));
  return ok();
});

export const Component: FC = () => (
  <PrivateLayout>
    <Products />
  </PrivateLayout>
);
