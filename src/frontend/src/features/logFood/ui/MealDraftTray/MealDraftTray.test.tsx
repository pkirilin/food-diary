import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type FC, useState } from 'react';
import { type AppStore } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { API_URL } from '@/shared/config';
import { captureFocusDuring } from '@tests/lib';
import { server } from '@tests/mockApi/server';
import { render } from '@tests/render';
import { CHICKEN, MEAL_DRAFT_DATE, OATS, configureStoreWithMealDraft } from '../mealDraft.fixture';
import { MealDraftTray } from './MealDraftTray';

interface TrayUnderSearchProps {
  initialQuery: string;
  onOpenProduct: (productId: number) => void;
  onLogged: (date: string) => void;
}

const TrayUnderSearch: FC<TrayUnderSearchProps> = ({ initialQuery, onOpenProduct, onLogged }) => {
  const [query, setQuery] = useState(initialQuery);

  return (
    <>
      <input
        type="search"
        aria-label="Search products"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
        }}
      />
      <MealDraftTray query={query} onOpenProduct={onOpenProduct} onLogged={onLogged} />
    </>
  );
};

const renderTray = async (store: AppStore, { initialQuery = '' } = {}) => {
  const onOpenProduct = vi.fn<(productId: number) => void>();
  const onLogged = vi.fn<(date: string) => void>();

  await render(
    <TrayUnderSearch
      initialQuery={initialQuery}
      onOpenProduct={onOpenProduct}
      onLogged={onLogged}
    />,
    { store },
  );

  return { tray: await screen.findByRole('region'), onOpenProduct, onLogged };
};

const renderTrayWithOatsAndChicken = (options?: { initialQuery?: string }) =>
  renderTray(configureStoreWithMealDraft([OATS, CHICKEN]), options);

const getToggle = (tray: HTMLElement): HTMLElement =>
  within(tray).getByRole('button', { name: 'Picked foods' });

const findPickedFoods = (tray: HTMLElement): Promise<HTMLElement> =>
  within(tray).findByRole('list', { name: 'Picked foods' });

const failNextLogFood = (): void => {
  server.use(
    http.post(`${API_URL}/api/v1/notes/batch`, () => HttpResponse.json({}, { status: 500 }), {
      once: true,
    }),
  );
};

test('the tray is headed with the Meal and asks for a first food while the Meal Draft is empty', async () => {
  const { tray } = await renderTray(configureStoreWithMealDraft([], foodLogModel.MealType.Lunch));

  expect(tray).toHaveAccessibleName('Lunch');
  expect(within(tray).getByText('0')).toBeVisible();
  expect(tray).toHaveTextContent('Tap ⊕ to add a food');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeDisabled();
});

test('the tray cannot expand while the Meal Draft is empty', async () => {
  const { tray } = await renderTray(configureStoreWithMealDraft());

  expect(getToggle(tray)).toBeDisabled();
});

test('the tray counts the picked products and totals their calories', async () => {
  const { tray } = await renderTrayWithOatsAndChicken();

  expect(within(tray).getByText('2')).toBeVisible();
  expect(tray).toHaveTextContent('737 kcal');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeEnabled();
});

test('the expanded tray lists the picked products in the order picked, without a quantity field', async () => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken();
  const toggle = getToggle(tray);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await user.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const rows = within(await findPickedFoods(tray)).getAllByRole('listitem');
  expect(rows.map(row => row.textContent)).toEqual<string[]>([
    expect.stringMatching(/^Oats100 g · 379 kcal/),
    expect.stringMatching(/^Chicken150 g · 358 kcal/),
  ]);
  expect(within(tray).queryByRole('textbox')).not.toBeInTheDocument();
  expect(within(tray).queryByRole('spinbutton')).not.toBeInTheDocument();

  await user.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() =>
    expect(within(tray).queryByRole('list', { name: 'Picked foods' })).not.toBeInTheDocument(),
  );
});

test('deleting a product from the expanded tray updates the count and the total', async () => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken();
  await user.click(getToggle(tray));
  const pickedFoods = await findPickedFoods(tray);

  await user.click(within(pickedFoods).getByRole('button', { name: 'Delete Oats' }));

  expect(within(pickedFoods).getAllByRole('listitem')).toHaveLength(1);
  expect(within(pickedFoods).getByRole('listitem')).toHaveTextContent('Chicken');
  expect(within(tray).getByText('1')).toBeVisible();
  expect(within(tray).getByText('358 kcal')).toBeVisible();

  await user.click(within(pickedFoods).getByRole('button', { name: 'Delete Chicken' }));

  expect(within(tray).getByText('0')).toBeVisible();
  expect(tray).toHaveTextContent('Tap ⊕ to add a food');
  expect(within(tray).getByRole('button', { name: 'Log food' })).toBeDisabled();
});

test('tapping the Meal name on the tray toggles the picked foods', async () => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken();
  const toggle = getToggle(tray);

  await user.click(within(tray).getByText('Breakfast'));

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(await findPickedFoods(tray)).toBeVisible();

  await user.click(within(tray).getByText('Breakfast'));

  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('expanding the tray moves the focus off the search field, so the phone keyboard closes', async () => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken();
  await user.click(screen.getByRole('searchbox', { name: 'Search products' }));
  const toggle = getToggle(tray);

  // A tap in iOS Safari clicks a button without focusing it, which user.click can't reproduce
  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(toggle).toHaveFocus();
  await findPickedFoods(tray);
});

test.each([
  { change: 'typing in the search', initialQuery: '', type: 'r' },
  {
    change: 'clearing the search, as adding a found product does',
    initialQuery: 'bre',
    type: '{Backspace>3}',
  },
])('$change collapses the expanded tray', async ({ initialQuery, type }) => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken({ initialQuery });
  const toggle = getToggle(tray);
  await user.click(toggle);
  await findPickedFoods(tray);

  await user.type(screen.getByRole('searchbox', { name: 'Search products' }), type);

  await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
});

test('tapping a tray row focuses a text input during the tap, then opens the product', async () => {
  const user = userEvent.setup();
  const { tray, onOpenProduct } = await renderTrayWithOatsAndChicken();
  await user.click(getToggle(tray));
  const target = within(await findPickedFoods(tray)).getByRole('button', { name: /^Oats/ });
  const focusedDuringTap = captureFocusDuring('click');

  await user.click(target);

  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
  expect(onOpenProduct).toHaveBeenCalledWith(OATS.id);
});

test('a failed Log food keeps the Meal Draft, shows an error and can be retried', async () => {
  const user = userEvent.setup();
  const { tray, onLogged } = await renderTray(configureStoreWithMealDraft([CHICKEN]));
  failNextLogFood();

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  expect(await within(tray).findByRole('alert')).toHaveTextContent(
    'Something went wrong. Please try again later.',
  );
  expect(within(tray).getByText('1')).toBeVisible();
  expect(tray).toHaveTextContent('358 kcal');
  expect(onLogged).not.toHaveBeenCalled();

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  await waitFor(() => expect(onLogged).toHaveBeenCalledWith(MEAL_DRAFT_DATE));
});

test('Log food does not toggle the picked foods', async () => {
  const user = userEvent.setup();
  const { tray } = await renderTrayWithOatsAndChicken();
  failNextLogFood();

  await user.click(within(tray).getByRole('button', { name: 'Log food' }));

  await within(tray).findByRole('alert');
  expect(getToggle(tray)).toHaveAttribute('aria-expanded', 'false');
});
