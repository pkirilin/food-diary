import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { captureFocusDuring } from '@tests/captureFocusDuring';
import { render } from '@tests/render';
import { configureStoreWithMealDraft } from '../mealDraft.fixture';
import { LogFoodSearchResults } from './LogFoodSearchResults';

const renderSearchResults = async (query: string) => {
  const onQueryChange = vi.fn<(query: string) => void>();
  const onCreateProduct = vi.fn<(name: string) => void>();

  await render(
    <LogFoodSearchResults
      query={query}
      onQueryChange={onQueryChange}
      onCreateProduct={onCreateProduct}
      onOpenProduct={vi.fn<(productId: number) => void>()}
    />,
    { store: configureStoreWithMealDraft() },
  );

  return { onQueryChange, onCreateProduct };
};

test('a query that only longer product names contain offers to create it after the results', async () => {
  const user = userEvent.setup();
  const { onCreateProduct } = await renderSearchResults('Chocolate');

  expect(await screen.findByRole('button', { name: 'Add Chocolate cake' })).toBeVisible();
  const foundProducts = screen.getByRole('list', { name: 'Found products' });
  const lastRow = within(foundProducts).getAllByRole('listitem').at(-1);
  expect(lastRow).toHaveTextContent('Create "Chocolate"');

  await user.click(screen.getByRole('button', { name: 'Create "Chocolate"' }));

  expect(onCreateProduct).toHaveBeenCalledWith('Chocolate');
});

test('a query that names an existing product, in any case, offers no Create', async () => {
  await renderSearchResults(' cheese ');

  expect(await screen.findByRole('button', { name: 'Add Cheese' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /^Create/ })).not.toBeInTheDocument();
});

test('a search that finds nothing offers to create the product named by the query', async () => {
  const user = userEvent.setup();
  const { onCreateProduct } = await renderSearchResults('Yogurt');

  await user.click(await screen.findByRole('button', { name: 'Create "Yogurt"' }));

  expect(onCreateProduct).toHaveBeenCalledWith('Yogurt');
});

test('the Create row focuses a text input during the tap', async () => {
  const user = userEvent.setup();
  await renderSearchResults('Yogurt');
  const target = await screen.findByRole('button', { name: 'Create "Yogurt"' });
  const focusedDuringTap = captureFocusDuring('click');

  await user.click(target);

  expect(focusedDuringTap()).toBeInstanceOf(HTMLInputElement);
});

test('⊕ on a found product clears the search', async () => {
  const user = userEvent.setup();
  const { onQueryChange } = await renderSearchResults('chick');

  await user.click(await screen.findByRole('button', { name: 'Add Chicken' }));

  expect(onQueryChange).toHaveBeenCalledWith('');
});
