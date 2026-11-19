import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type foodLogModel } from '@/entities/foodLog';
import { captureFocusDuring } from '@tests/lib';
import { render } from '@tests/render';
import {
  CHICKEN,
  OATS,
  configureStoreWithMealDraft,
  getMealDraftFoodLogs,
} from '../mealDraft.fixture';
import { FoodLogQuantityForm } from './FoodLogQuantityForm';

const renderQuantityForm = async (
  product: foodLogModel.MealDraftProduct,
  pickedProducts: foodLogModel.MealDraftProduct[],
) => {
  const store = configureStoreWithMealDraft(pickedProducts);
  const onDone = vi.fn<() => void>();
  const onEditProduct = vi.fn<() => void>();

  await render(
    <FoodLogQuantityForm
      product={product}
      foodLog={
        getMealDraftFoodLogs(store).find(foodLog => foodLog.product.id === product.id) ?? null
      }
      onDone={onDone}
      onEditProduct={onEditProduct}
    />,
    { store },
  );

  return {
    store,
    onDone,
    onEditProduct,
    quantityField: await screen.findByRole<HTMLInputElement>('textbox', { name: 'Quantity' }),
  };
};

const renderChickenQuantity = () => renderQuantityForm(CHICKEN, [OATS]);

test('the quantity form opens with the default quantity selected, and shows the calories of the typed one', async () => {
  const user = userEvent.setup();
  const { quantityField } = await renderChickenQuantity();

  expect(screen.getByRole('heading', { name: 'Chicken' })).toBeVisible();
  expect(screen.getByText('239 kcal per 100 g')).toBeVisible();
  expect(quantityField).toHaveFocus();
  expect(quantityField).toHaveValue('150');
  expect([quantityField.selectionStart, quantityField.selectionEnd]).toStrictEqual<
    (number | null)[]
  >([0, 3]);
  expect(screen.getByText('358 kcal')).toBeVisible();

  await user.keyboard('200');

  expect(quantityField).toHaveValue('200');
  expect(await screen.findByText('478 kcal')).toBeVisible();
});

test.each(['5', '1001', '12.5', 'abc', ''])(
  'a quantity of "%s" shows an error and cannot be confirmed',
  async invalidQuantity => {
    const user = userEvent.setup();
    const { onDone, quantityField } = await renderChickenQuantity();

    await user.clear(quantityField);
    if (invalidQuantity !== '') {
      await user.type(quantityField, invalidQuantity);
    }

    expect(quantityField).toBeInvalid();
    expect(await screen.findByText('Enter a whole number from 10 to 1000')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    await user.type(quantityField, '{Enter}');

    expect(onDone).not.toHaveBeenCalled();
  },
);

test('Enter on an invalid quantity keeps the focus on the quantity field', async () => {
  const user = userEvent.setup();
  const { quantityField } = await renderChickenQuantity();
  await user.clear(quantityField);

  await user.type(quantityField, '{Enter}');

  await waitFor(() => expect(quantityField).toHaveFocus());
});

test('Add focuses a text input during the tap, then adds the product with the typed quantity', async () => {
  const user = userEvent.setup();
  const { store, onDone } = await renderChickenQuantity();
  await user.keyboard('200');
  const target = screen.getByRole('button', { name: 'Add' });
  const focusedDuringTap = captureFocusDuring('submit');

  await user.click(target);

  await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(getMealDraftFoodLogs(store)).toStrictEqual<foodLogModel.MealDraftFoodLog[]>([
    { product: OATS, quantity: 100 },
    { product: CHICKEN, quantity: 200 },
  ]);
});

test('Save on a picked product focuses a text input during the tap, then saves the typed quantity in the same place', async () => {
  const user = userEvent.setup();
  const { store, onDone } = await renderQuantityForm(OATS, [OATS, CHICKEN]);
  await user.keyboard('50');
  const target = screen.getByRole('button', { name: 'Save' });
  const focusedDuringTap = captureFocusDuring('submit');

  await user.click(target);

  await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(getMealDraftFoodLogs(store)).toStrictEqual<foodLogModel.MealDraftFoodLog[]>([
    { product: OATS, quantity: 50 },
    { product: CHICKEN, quantity: 150 },
  ]);
});

test('Edit product focuses a text input during the tap', async () => {
  const user = userEvent.setup();
  const { onEditProduct } = await renderChickenQuantity();
  const target = screen.getByRole('button', { name: /edit product/i });
  const focusedDuringTap = captureFocusDuring('click');

  await user.click(target);

  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(onEditProduct).toHaveBeenCalledOnce();
});
