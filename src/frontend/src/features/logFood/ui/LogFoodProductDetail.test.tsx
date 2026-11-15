import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type FC, useState } from 'react';
import { API_URL } from '@/shared/config';
import { server } from '@tests/mockApi/server';
import { render } from '@tests/render';
import { EditProductForm } from './EditProductForm';
import { LogFoodProductDetail } from './LogFoodProductDetail';
import { CHICKEN, configureStoreWithMealDraft } from './mealDraft.fixture';

interface ProductDetailWithEditFormProps {
  productId: number;
}

const ProductDetailWithEditForm: FC<ProductDetailWithEditFormProps> = ({ productId }) => {
  const [editing, setEditing] = useState(false);

  return editing ? (
    <EditProductForm
      productId={productId}
      onSaved={() => {
        setEditing(false);
      }}
    />
  ) : (
    <LogFoodProductDetail
      productId={productId}
      onDone={() => {}}
      onEditProduct={() => {
        setEditing(true);
      }}
    />
  );
};

const editChickenDefaultQuantity = async (user: UserEvent, defaultQuantity: string) => {
  await render(<ProductDetailWithEditForm productId={CHICKEN.id} />, {
    store: configureStoreWithMealDraft(),
  });
  await user.click(await screen.findByRole('button', { name: /edit product/i }));
  const defaultQuantityField = await screen.findByRole('textbox', { name: 'Default quantity, g' });
  await user.clear(defaultQuantityField);
  await user.type(defaultQuantityField, defaultQuantity);
};

// The held request falls through to the default product handler once released
const holdNextProductFetch = (): (() => void) => {
  const { promise: released, resolve: release } = Promise.withResolvers<void>();
  server.use(
    http.get(
      `${API_URL}/api/v1/products/:id`,
      async () => {
        await released;
      },
      { once: true },
    ),
  );
  return release;
};

test('a product saved outside the Meal Draft opens its quantity form with the new default quantity', async () => {
  const user = userEvent.setup();
  await editChickenDefaultQuantity(user, '123');
  const releaseProductFetch = holdNextProductFetch();

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('progressbar')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: 'Quantity' })).not.toBeInTheDocument();
  releaseProductFetch();
  expect(await screen.findByRole('textbox', { name: 'Quantity' })).toHaveValue('123');
  expect(screen.getByText('293 kcal')).toBeVisible();
});

test('a product that fails to load again after a save shows the load error instead of the old product', async () => {
  const user = userEvent.setup();
  await editChickenDefaultQuantity(user, '123');
  server.use(
    http.get(`${API_URL}/api/v1/products/:id`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('The product could not be loaded')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: 'Quantity' })).not.toBeInTheDocument();
});
