import { screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type AppStore } from '@/app/store';
import { type foodLogModel } from '@/entities/foodLog';
import { API_URL } from '@/shared/config';
import { captureFocusDuring } from '@tests/captureFocusDuring';
import { holdNextNutritionSuggestion } from '@tests/holdNextNutritionSuggestion';
import { server } from '@tests/mockApi/server';
import { render } from '@tests/render';
import {
  CHICKEN,
  OATS,
  configureStoreWithMealDraft,
  getMealDraftFoodLogs,
} from '../mealDraft.fixture';
import { EditProductForm } from './EditProductForm';

const renderChickenForm = async (store: AppStore = configureStoreWithMealDraft()) => {
  const onSaved = vi.fn<() => void>();

  await render(<EditProductForm productId={CHICKEN.id} onSaved={onSaved} />, { store });

  return { onSaved, nameField: await screen.findByRole('textbox', { name: 'Name' }) };
};

const replaceFieldValue = async (user: UserEvent, field: HTMLElement, value: string) => {
  await user.clear(field);
  await user.type(field, value);
};

const failNextSave = (): void => {
  server.use(
    http.put(`${API_URL}/api/v1/products/:id`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );
};

test('the product form is prefilled with the product, with the name focused', async () => {
  const { nameField } = await renderChickenForm();

  expect(nameField).toHaveValue('Chicken');
  expect(nameField).toHaveFocus();
  expect(screen.getByRole('textbox', { name: 'Calories, kcal' })).toHaveValue('239');
  expect(screen.getByRole('textbox', { name: 'Default quantity, g' })).toHaveValue('150');
  expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
});

test('saving a product with its own name unchanged saves it', async () => {
  const user = userEvent.setup();
  const { onSaved } = await renderChickenForm();
  await replaceFieldValue(user, screen.getByRole('textbox', { name: 'Calories, kcal' }), '250');

  await user.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
});

test('Save focuses a text input during the tap', async () => {
  const user = userEvent.setup();
  const { onSaved } = await renderChickenForm();
  const target = screen.getByRole('button', { name: 'Save' });
  const focusedDuringTap = captureFocusDuring('submit');

  await user.click(target);

  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
});

test('saving a product under the name of another product shows the clash on the form and leaves the Meal Draft unchanged', async () => {
  const user = userEvent.setup();
  const store = configureStoreWithMealDraft([OATS, CHICKEN]);
  const { onSaved, nameField } = await renderChickenForm(store);
  await replaceFieldValue(user, nameField, 'Oats');
  const defaultQuantity = screen.getByRole('textbox', { name: 'Default quantity, g' });
  await replaceFieldValue(user, defaultQuantity, '200');

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText("Product with the name 'Oats' already exists")).toBeVisible();
  expect(nameField).toHaveValue('Oats');
  expect(defaultQuantity).toHaveValue('200');
  expect(onSaved).not.toHaveBeenCalled();
  expect(getMealDraftFoodLogs(store)).toStrictEqual<foodLogModel.MealDraftFoodLog[]>([
    { product: OATS, quantity: 100 },
    { product: CHICKEN, quantity: 150 },
  ]);
});

test('a failed product save shows an error and keeps the input', async () => {
  const user = userEvent.setup();
  const { onSaved, nameField } = await renderChickenForm();
  await replaceFieldValue(user, nameField, 'Turkey');
  failNextSave();

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Something went wrong. Please try again later.',
  );
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Turkey');
  expect(onSaved).not.toHaveBeenCalled();
});

test('Save is disabled while nutrition values are being suggested', async () => {
  const user = userEvent.setup();
  await renderChickenForm();
  const suggestion = holdNextNutritionSuggestion({ calories: 165 });

  await user.click(screen.getByRole('button', { name: 'Suggest Calories' }));

  const save = screen.getByRole('button', { name: 'Save' });
  expect(save).toBeDisabled();

  suggestion.release();

  await waitFor(() => expect(save).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Calories, kcal' })).toHaveValue('165');
});

test('a failed Save of an edited product drops the focus from the input held for the next field', async () => {
  const user = userEvent.setup();
  await renderChickenForm();
  failNextSave();

  await user.click(screen.getByRole('button', { name: 'Save' }));

  await screen.findByRole('alert');
  expect(document.body).toHaveFocus();
});
