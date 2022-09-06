import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import { db } from 'src/testing/server/db';
import Products from './Products';

test('products are loaded into table', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/bread/i));
  expect(screen.getByLabelText(/bread calories cost is 250/i));
  expect(screen.getByLabelText(/bread is in bakery category/i));
});

test('products table is showing message for empty data', async () => {
  db.product.deleteMany({ where: {} });
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/no products found/i));
});

test('product can be created', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open create product dialog/i));

  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  const category = dialog.getByPlaceholderText(/category/i);
  await userEvent.type(productName, 'Yoghurt');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '105');
  await userEvent.click(category);
  await userEvent.click(within(screen.getByRole('listbox')).getByText(/dairy/i));

  await userEvent.click(dialog.getByText(/create/i));
  await waitForElementToBeRemoved(screen.queryByRole('dialog'));

  expect(await screen.findByText(/yoghurt/i));
  expect(screen.getByLabelText(/yoghurt calories cost is 105/i));
  expect(screen.getByLabelText(/yoghurt is in dairy category/i));
});

test('product can be edited', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open edit product dialog for bread/i));

  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  await userEvent.clear(productName);
  await userEvent.type(productName, 'Rye bread');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '95');
  await userEvent.click(dialog.getByText(/save/i));

  expect(await screen.findByText(/rye bread/i));
  expect(screen.getByLabelText(/rye bread calories cost is 95/i));
  expect(screen.getByLabelText(/rye bread is in bakery category/i));
});

test('product can be selected', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/select bread/i));

  expect(screen.getByText(/1 selected/i));
});

test('all products can be selected', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/select all/i));

  expect(screen.getByText(/(\d)+ selected/i));
});

test('products can be deleted', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/select bread/i));
  await userEvent.click(screen.getByLabelText(/delete selected products/i));
  const dialog = screen.getByRole('dialog');
  await userEvent.click(within(dialog).getByText(/ok/i));
  await waitForElementToBeRemoved(screen.queryByRole('dialog'));

  expect(screen.queryByText(/bread/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/(\d)+ selected/i)).not.toBeInTheDocument();
});

test('products can be filtered by category', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open products filter/i));

  const filterPopup = within(screen.getByRole('presentation'));
  const category = filterPopup.getByPlaceholderText(/category/i);
  await userEvent.click(category);
  await userEvent.click(within(await screen.findByRole('listbox')).getByText(/cereals/i));
  await userEvent.click(document.body);

  await waitFor(() => expect(screen.queryByText(/bread/i)).not.toBeInTheDocument());
  const filterChip = screen.getByLabelText(/applied filter: category/i);
  expect(within(filterChip).queryByText(/cereals/i)).toBeVisible();
  expect(screen.getByText(/rice/i));
});

test('products can be filtered by name', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open products filter/i));

  const filterPopup = within(screen.getByRole('presentation'));
  const productName = filterPopup.getByPlaceholderText(/product name/i);
  await userEvent.type(productName, 'bre');
  await userEvent.click(document.body);

  await waitFor(() => expect(screen.queryByText(/rice/i)).not.toBeInTheDocument());
  const filterChip = screen.getByLabelText(/applied filter: product search name/i);
  expect(within(filterChip).queryByText(/bre/i)).toBeVisible();
  expect(screen.getByText(/bread/i));
});

test('products filter can be reset', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open products filter/i));

  const filterPopup = within(screen.getByRole('presentation'));
  const productName = filterPopup.getByPlaceholderText(/product name/i);
  const category = filterPopup.getByPlaceholderText(/category/i);
  await userEvent.type(productName, 'sfdsfwfegegrw');
  await userEvent.click(category);
  await userEvent.click(within(await screen.findByRole('listbox')).getByText(/dairy/i));
  await waitFor(() => expect(screen.getByText(/no products found/i)));
  await userEvent.click(filterPopup.getByRole('button', { name: /reset/i }));

  expect(screen.getByText(/bread/i));
  expect(screen.getByText(/rice/i));
});

test('products in table are split by pages', async () => {
  render(<Products />, { pageSizeOverride: 2 });

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  expect(screen.getByText(/1–.* of .*/i));

  await userEvent.click(screen.getByLabelText(/go to next page/i));
  expect(screen.getByText(/.*–.* of .*/i)).not.toHaveTextContent(/1–.* of .*/i);
});
