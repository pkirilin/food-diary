import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Products from './Products';

test('products are loaded into table', async () => {
  render(<Products />);

  const bread = await screen.findByText(/bread/i);

  expect(bread).toBeVisible();
  expect(screen.getByLabelText(/bread calories cost is 250/i)).toBeVisible();
  expect(screen.getByLabelText(/bread is in cereals category/i)).toBeVisible();
});

test('product can be created', async () => {
  render(<Products />);

  const createButton = await screen.findByRole('button', { name: /open create product dialog/i });
  await waitFor(() => expect(createButton).toBeEnabled());
  await userEvent.click(createButton);

  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  const defaultQuantity = dialog.getByPlaceholderText(/default quantity/i);
  const category = dialog.getByPlaceholderText(/category/i);
  await userEvent.type(productName, 'Cheesecake');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '321');
  await userEvent.clear(defaultQuantity);
  await userEvent.type(defaultQuantity, '123');
  await userEvent.click(category);
  await userEvent.click(within(screen.getByRole('listbox')).getByText(/bakery/i));
  await userEvent.click(dialog.getByLabelText(/create cheesecake/i));

  expect(await screen.findByText(/cheesecake/i));
  expect(screen.getByLabelText(/cheesecake calories cost is 321/i));
  expect(screen.getByLabelText(/cheesecake default quantity is 123/i));
  expect(screen.getByLabelText(/cheesecake is in bakery category/i));
});

test('product can be edited', async () => {
  render(<Products />);

  const editButton = await screen.findByRole('button', {
    name: /open edit product dialog for bread/i,
  });
  await userEvent.click(editButton);

  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  const defaultQuantity = dialog.getByPlaceholderText(/default quantity/i);
  await userEvent.clear(productName);
  await userEvent.type(productName, 'Rye bread');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '95');
  await userEvent.clear(defaultQuantity);
  await userEvent.type(defaultQuantity, '105');
  await userEvent.click(dialog.getByLabelText(/save/i));

  expect(await screen.findByText(/rye bread/i));
  expect(screen.getByLabelText(/rye bread calories cost is 95/i));
  expect(screen.getByLabelText(/rye bread default quantity is 105/i));
  expect(screen.getByLabelText(/rye bread is in cereals category/i));
});

test('new product input is validated', async () => {
  render(<Products />);

  const createButton = await screen.findByRole('button', { name: /open create product dialog/i });
  await waitFor(() => expect(createButton).toBeEnabled());
  await userEvent.click(createButton);

  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  await userEvent.clear(productName);
  await userEvent.type(productName, 'b');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '5001');
  await userEvent.click(productName);

  expect(productName).toBeInvalid();
  expect(caloriesCost).toBeInvalid();
  expect(dialog.getByLabelText(/create b/i)).toBeDisabled();
});

test('existing product input is validated', async () => {
  render(<Products />);

  const editButton = await screen.findByRole('button', {
    name: /open edit product dialog for bread/i,
  });
  await userEvent.click(editButton);
  const dialog = within(screen.getByRole('dialog'));
  const productName = dialog.getByPlaceholderText(/product name/i);
  const caloriesCost = dialog.getByPlaceholderText(/calories cost/i);
  await userEvent.clear(productName);
  await userEvent.type(productName, 'a');
  await userEvent.clear(caloriesCost);
  await userEvent.type(caloriesCost, '5002');
  await userEvent.click(productName);

  expect(productName).toBeInvalid();
  expect(caloriesCost).toBeInvalid();
  expect(dialog.getByRole('button', { name: /save/i })).toBeDisabled();
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

test('product with empty category cannot be saved', async () => {
  render(<Products />);

  const editButton = await screen.findByRole('button', {
    name: /open edit product dialog for bread/i,
  });
  await userEvent.click(editButton);

  const dialog = within(screen.getByRole('dialog'));
  const category = dialog.getByPlaceholderText(/category/i);
  await userEvent.clear(category);

  expect(dialog.getByLabelText(/save/i)).toBeDisabled();
  expect(dialog.getByText(/category is required/i)).toBeVisible();
});
