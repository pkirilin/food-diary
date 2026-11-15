import { List } from '@mui/material';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type AppStore } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { captureFocusDuring } from '@tests/captureFocusDuring';
import { render } from '@tests/render';
import { FoundProductListItem } from './FoundProductListItem';
import { CHICKEN, configureStoreWithMealDraft, getMealDraftFoodLogs } from './mealDraft.fixture';

const renderFoundChicken = async (store: AppStore) => {
  const onOpen = vi.fn<(productId: number) => void>();
  const onFoodLogAdded = vi.fn<() => void>();

  await render(
    <>
      <input type="search" aria-label="Search products" />
      <List>
        <FoundProductListItem product={CHICKEN} onOpen={onOpen} onFoodLogAdded={onFoodLogAdded} />
      </List>
    </>,
    { store },
  );

  return { onOpen, onFoodLogAdded };
};

test('a found product shows its name, default quantity and calories', async () => {
  await renderFoundChicken(configureStoreWithMealDraft());

  const chicken = await screen.findByRole('listitem');
  expect(chicken).toHaveTextContent('Chicken');
  expect(chicken).toHaveTextContent('150 g · 358 kcal');
});

test('⊕ adds a product with its default quantity and keeps the focus in the search field', async () => {
  const user = userEvent.setup();
  const store = configureStoreWithMealDraft();
  const { onOpen, onFoodLogAdded } = await renderFoundChicken(store);
  const searchField = screen.getByRole('searchbox', { name: 'Search products' });
  await user.click(searchField);

  await user.click(await screen.findByRole('button', { name: 'Add Chicken' }));

  expect(getMealDraftFoodLogs(store)).toStrictEqual<foodLogModel.MealDraftFoodLog[]>([
    { product: CHICKEN, quantity: 150 },
  ]);
  expect(onFoodLogAdded).toHaveBeenCalledOnce();
  expect(onOpen).not.toHaveBeenCalled();
  expect(searchField).toHaveFocus();
});

test('a product in the Meal Draft shows as selected, and ⊕ on it takes it out', async () => {
  const user = userEvent.setup();
  const store = configureStoreWithMealDraft([CHICKEN]);
  const { onFoodLogAdded } = await renderFoundChicken(store);

  await user.click(await screen.findByRole('button', { name: 'Remove Chicken' }));

  expect(await screen.findByRole('button', { name: 'Add Chicken' })).toBeVisible();
  expect(getMealDraftFoodLogs(store)).toStrictEqual<foodLogModel.MealDraftFoodLog[]>([]);
  expect(onFoodLogAdded).not.toHaveBeenCalled();
});

test('tapping a found product focuses a text input during the tap, then opens the product', async () => {
  const user = userEvent.setup();
  const { onOpen } = await renderFoundChicken(configureStoreWithMealDraft());
  const target = await screen.findByRole('button', { name: /^Chicken/ });
  const focusedDuringTap = captureFocusDuring('click');

  await user.click(target);

  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(focusedDuringTap()).not.toBe(screen.getByRole('searchbox', { name: 'Search products' }));
  expect(onOpen).toHaveBeenCalledWith(CHICKEN.id);
});
