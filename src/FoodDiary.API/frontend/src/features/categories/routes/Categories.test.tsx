import { screen, waitForElementToBeRemoved, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Categories from './Categories';

test('categories are displayed with their product counts', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(screen.getByText(/dairy/i));
  expect(screen.getByText(/bakery/i));
  expect(screen.getByText(/frozen foods/i));
  expect(screen.getByLabelText(/2 products in dairy/i));
  expect(screen.getByLabelText(/1 product in bakery/i));
  expect(screen.getByLabelText(/no products in frozen foods/i));
});

test('category can be created', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/create new category/i));

  const dialog = within(screen.getByRole('dialog'));
  await userEvent.type(dialog.getByPlaceholderText(/category name/i), 'New fancy category');
  await userEvent.click(dialog.getByLabelText(/create new fancy category/i));
  await waitForElementToBeRemoved(dialog.getByRole('progressbar'));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  expect(screen.getByText(/new fancy category/i));
  expect(screen.getByLabelText(/no products in new fancy category/i));
});

test('category can be edited', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/edit bakery/i));

  const dialog = within(screen.getByRole('dialog'));
  const name = dialog.getByPlaceholderText(/category name/i);
  await userEvent.clear(name);
  await userEvent.type(name, 'Modified Bakery');
  await userEvent.click(dialog.getByLabelText(/save modified bakery/i));
  await waitForElementToBeRemoved(dialog.getByRole('progressbar'));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  expect(screen.getByText(/modified bakery/i));
});

test('category can be deleted', async () => {
  render(<Categories />);

  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.click(screen.getByLabelText(/delete bakery/i));

  const dialog = within(screen.getByRole('dialog'));
  await userEvent.click(dialog.getByLabelText(/delete bakery/i));
  await waitForElementToBeRemoved(dialog.getByRole('progressbar'));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  expect(screen.queryByText(/bakery/i)).toBeNull();
});
