import { screen, waitForElementToBeRemoved, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Categories from './Categories';

test('categories are displayed with their product counts', () => {
  render(<Categories />);

  expect(screen.getByText(/dairy/i));
  expect(screen.getByText(/bakery/i));
  expect(screen.getByText(/frozen foods/i));
  expect(screen.getByLabelText(/2 products in dairy/i));
  expect(screen.getByLabelText(/1 product in bakery/i));
  expect(screen.getByLabelText(/no products in frozen foods/i));
});

test('category can be created', async () => {
  render(<Categories />);

  await userEvent.click(screen.getByLabelText(/create new category/i));

  const dialog = within(screen.getByRole('dialog'));
  await userEvent.type(dialog.getByPlaceholderText(/category name/i), 'Test category');
  await userEvent.click(dialog.getByLabelText(/create category test category/i));
  await waitForElementToBeRemoved(dialog.getByRole('progressbar'));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  expect(screen.getByText(/test category/i));
  expect(screen.getByLabelText(/0 products in test category/i));
});
