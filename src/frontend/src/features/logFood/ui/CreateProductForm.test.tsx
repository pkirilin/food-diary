import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type AppStore } from '@/app/store';
import { productModel } from '@/entities/product';
import { API_URL } from '@/shared/config';
import { captureFocusDuring } from '@tests/captureFocusDuring';
import { server } from '@tests/mockApi/server';
import { render } from '@tests/render';
import { CreateProductForm } from './CreateProductForm';
import { configureStoreWithMealDraft, getMealDraftFoodLogs } from './mealDraft.fixture';

const renderNewYogurtForm = async (store: AppStore = configureStoreWithMealDraft()) => {
  const onCreated = vi.fn<() => void>();

  await render(
    <CreateProductForm
      defaultValues={{ ...productModel.EMPTY_FORM_VALUES, name: 'Yogurt' }}
      onCreated={onCreated}
    />,
    { store },
  );

  return { onCreated, nameField: await screen.findByRole('textbox', { name: 'Name' }) };
};

interface PickedNameAndQuantity {
  name: string;
  quantity: number;
}

const getPickedNamesAndQuantities = (store: AppStore): PickedNameAndQuantity[] =>
  getMealDraftFoodLogs(store).map(({ product, quantity }) => ({ name: product.name, quantity }));

const replaceFieldValue = async (user: UserEvent, field: HTMLElement, value: string) => {
  await user.clear(field);
  await user.type(field, value);
};

const failNextCreate = (): void => {
  server.use(
    http.post(`${API_URL}/api/v1/products`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );
};

test('the new product form opens with the name focused', async () => {
  const { nameField } = await renderNewYogurtForm();

  expect(nameField).toHaveFocus();
});

test('Create focuses a text input during the tap, then adds the product to the Meal Draft', async () => {
  const user = userEvent.setup();
  const store = configureStoreWithMealDraft();
  const { onCreated } = await renderNewYogurtForm(store);
  const target = screen.getByRole('button', { name: 'Create' });
  const focusedDuringTap = captureFocusDuring('submit');

  await user.click(target);

  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(getPickedNamesAndQuantities(store)).toStrictEqual<PickedNameAndQuantity[]>([
    { name: 'Yogurt', quantity: 100 },
  ]);
});

test('Create with the name of an existing product shows the clash on the form and keeps the input', async () => {
  const user = userEvent.setup();
  const store = configureStoreWithMealDraft();
  const { onCreated, nameField } = await renderNewYogurtForm(store);
  await replaceFieldValue(user, nameField, 'Cheese');
  const calories = screen.getByRole('textbox', { name: 'Calories, kcal' });
  await replaceFieldValue(user, calories, '350');

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByText("Product with the name 'Cheese' already exists")).toBeVisible();
  expect(nameField).toHaveValue('Cheese');
  expect(calories).toHaveValue('350');
  expect(onCreated).not.toHaveBeenCalled();

  await user.type(nameField, ' yogurt');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
  expect(getPickedNamesAndQuantities(store)).toStrictEqual<PickedNameAndQuantity[]>([
    { name: 'Cheese yogurt', quantity: 100 },
  ]);
});

test('a failed Create shows an error and keeps the input', async () => {
  const user = userEvent.setup();
  const { onCreated } = await renderNewYogurtForm();
  failNextCreate();

  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Something went wrong. Please try again later.',
  );
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Yogurt');
  expect(onCreated).not.toHaveBeenCalled();
});

test('a failed Create drops the focus from the input held for the next field', async () => {
  const user = userEvent.setup();
  await renderNewYogurtForm();
  failNextCreate();

  await user.click(screen.getByRole('button', { name: 'Create' }));

  await screen.findByRole('alert');
  expect(document.body).toHaveFocus();
});

test('Create with an invalid form drops the focus from the input held for the next field', async () => {
  const user = userEvent.setup();
  const { nameField } = await renderNewYogurtForm();
  await user.clear(nameField);

  await user.click(screen.getByRole('button', { name: 'Create' }));

  await waitFor(() => expect(nameField).toBeInvalid());
  expect(document.body).toHaveFocus();
});
