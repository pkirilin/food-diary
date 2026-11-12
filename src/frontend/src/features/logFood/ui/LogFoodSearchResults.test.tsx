import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@tests/render';
import { LogFoodSearchResults } from './LogFoodSearchResults';

const renderSearchResults = async (query: string) => {
  const onCreateProduct = vi.fn<(name: string) => void>();

  await render(
    <LogFoodSearchResults
      query={query}
      onQueryChange={vi.fn<(query: string) => void>()}
      onCreateProduct={onCreateProduct}
      onOpenProduct={vi.fn<(productId: number) => void>()}
    />,
  );

  return { onCreateProduct };
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
