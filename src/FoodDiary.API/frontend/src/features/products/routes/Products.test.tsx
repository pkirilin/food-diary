import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
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
