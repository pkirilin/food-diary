import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Products from './Products';

test('products are loaded into table', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/bread/i));
  expect(screen.getByLabelText(/bread calories cost is 250/i));
  expect(screen.getByLabelText(/bread is in cereals category/i));
});

test('product can be created', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open create product dialog/i));

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

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open edit product dialog for bread/i));

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

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open create product dialog/i));
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

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open edit product dialog for bread/i));
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
  expect(dialog.getByText(/save/i)).toBeDisabled();
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
  const dialog = within(screen.getByRole('dialog'));
  await userEvent.click(dialog.getByText(/yes/i));

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

  await waitFor(() => {
    expect(screen.queryByText(/milk/i)).not.toBeInTheDocument();
  });
  const filterChip = screen.getByLabelText(/applied filter: category/i);
  expect(within(filterChip).queryByText(/cereals/i)).toBeVisible();
  expect(screen.getByText(/oats/i));
});

test('products can be filtered by name', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open products filter/i));

  const filterPopup = within(screen.getByRole('presentation'));
  const productName = filterPopup.getByPlaceholderText(/product name/i);
  await userEvent.type(productName, 'bre');
  await userEvent.click(document.body);

  await waitFor(() => {
    expect(screen.queryByText(/rice/i)).not.toBeInTheDocument();
  });
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
  expect(screen.getByText(/milk/i));
  expect(screen.getByText(/apple/i));
});

test('products in table are split by pages', async () => {
  render(<Products />, { pageSizeOverride: 2 });

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  expect(screen.getByText(/1–.* of .*/i));

  await userEvent.click(screen.getByLabelText(/go to next page/i));
  expect(screen.getByText(/.*–.* of .*/i)).not.toHaveTextContent(/1–.* of .*/i);
});

test('product with empty category cannot be saved', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/open edit product dialog for bread/i));

  const dialog = within(screen.getByRole('dialog'));
  const category = dialog.getByPlaceholderText(/category/i);
  await userEvent.clear(category);

  expect(dialog.getByLabelText(/save/i)).toBeDisabled();
  expect(dialog.getByText(/category is required/i)).toBeVisible();
});
