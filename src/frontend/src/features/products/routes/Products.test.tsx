import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@tests/render';
import Products from './Products';

test('products are loaded into table', async () => {
  render(<Products />);

  const bread = await screen.findByText(/bread/i);

  expect(bread).toBeVisible();
  expect(screen.getByLabelText(/bread calories cost is 250/i)).toBeVisible();
  expect(screen.getByLabelText(/bread is in cereals category/i)).toBeVisible();
});

test('product can be selected', async () => {
  render(<Products />);

  const breadCheckbox = await screen.findByLabelText(/select bread/i);
  await userEvent.click(breadCheckbox);

  expect(screen.getByText(/1 selected/i));
});

test('all products can be selected', async () => {
  render(<Products />);

  const selectAll = await screen.findByLabelText(/select all/i);
  await waitFor(() => expect(selectAll).toBeEnabled());
  await userEvent.click(selectAll);

  expect(screen.getByText(/(\d)+ selected/i));
});

test('products can be deleted', async () => {
  render(<Products />);

  const breadCheckbox = await screen.findByLabelText(/select bread/i);
  await userEvent.click(breadCheckbox);
  await userEvent.click(screen.getByLabelText(/delete selected products/i));
  const dialog = within(screen.getByRole('dialog'));
  await userEvent.click(dialog.getByText(/yes/i));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  await waitFor(() => expect(screen.queryByText(/bread/i)).not.toBeInTheDocument());
  expect(screen.queryByText(/(\d)+ selected/i)).not.toBeInTheDocument();
});

test('products can be filtered by category', async () => {
  const user = userEvent.setup();
  render(<Products />);

  const categoryField = await screen.findByLabelText(/category/i);
  await user.click(categoryField);
  const categorySelect = await screen.findByRole('listbox', { name: /category/i });
  const cereals = within(categorySelect).getByRole('option', { name: /cereals/i });
  await user.click(cereals);

  expect(await screen.findByText(/oats/i));
  await waitFor(() => expect(screen.queryByText(/milk/i)).not.toBeInTheDocument());
});

test('products can be filtered by name', async () => {
  const user = userEvent.setup();

  render(<Products />);
  const searchField = await screen.findByPlaceholderText(/search by name/i);
  await user.type(searchField, 'bre');

  expect(screen.getByText(/bread/i));
  expect(screen.queryByText(/rice/i)).not.toBeInTheDocument();
});

test('products in table are split by pages', async () => {
  render(<Products />, { pageSizeOverride: 2 });

  const paginationForTheFirstPage = await screen.findByText(/1–.* of .*/i);
  expect(paginationForTheFirstPage).toBeVisible();

  await userEvent.click(screen.getByLabelText(/go to next page/i));
  const paginationForTheSecondPage = await screen.findByText(/.*–.* of .*/i);
  expect(paginationForTheSecondPage).not.toHaveTextContent(/1–.* of .*/i);
});
