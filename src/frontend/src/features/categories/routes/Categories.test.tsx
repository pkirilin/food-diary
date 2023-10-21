import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Categories from './Categories';

test('placeholder text is shown for empty categories list', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/no categories/i));
});

test('categories are displayed with their product counts', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/dairy/i));
  expect(screen.getByText(/bakery/i));
  expect(screen.getByText(/frozen foods/i));
  expect(screen.getByLabelText(/2 products in dairy/i));
  expect(screen.getByLabelText(/1 product in bakery/i));
  expect(screen.getByLabelText(/no products in frozen foods/i));
});

test('category can be created', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/create new category/i));

  const dialog = within(screen.getByRole('dialog'));
  await userEvent.type(dialog.getByPlaceholderText(/category name/i), 'New fancy category');
  await userEvent.click(dialog.getByLabelText(/create new fancy category/i));
  await waitForElementToBeRemoved(screen.queryByRole('dialog'));

  expect(screen.getByText(/new fancy category/i));
  expect(screen.getByLabelText(/no products in new fancy category/i));
});

test('category can be edited', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/edit cereals/i));

  const dialog = within(screen.getByRole('dialog'));
  const name = dialog.getByPlaceholderText(/category name/i);
  await userEvent.clear(name);
  await userEvent.type(name, 'Modified Cereals');
  await userEvent.click(dialog.getByLabelText(/save modified cereals/i));

  expect(await screen.findByText(/modified cereals/i));
});

test('category can be deleted', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/delete cereals/i));

  const dialog = within(screen.getByRole('dialog'));
  await userEvent.click(dialog.getByLabelText(/delete cereals/i));

  expect(screen.queryByText(/cereals/i)).not.toBeInTheDocument();
});

test('category cannot be created while categories list is loading', async () => {
  render(<Categories />);

  expect(screen.getByRole('progressbar')).toBeVisible();
  expect(screen.getByLabelText(/create new category/i)).toBeDisabled();
});
