import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import Pages from './Pages';

test('pages are loaded into table', async () => {
  render(<Pages />);

  const pageItems = await screen.findAllByText(/^\d{4}-\d{2}-\d{2}$/);

  expect(pageItems.length).toBeGreaterThan(0);
});

test('pages can be exported to JSON if start/end dates specified', async () => {
  render(<Pages />);
  await userEvent.click(screen.getByLabelText(/show more options/i));
  await userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to json/i));
  await waitForElementToBeRemoved(dialog);
});

test('pages cannot be exported if start/end dates not specified', async () => {
  render(<Pages />);
  await userEvent.click(screen.getByLabelText(/show more options/i));
  await userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');
  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '01012022');

  const exportButton = await within(dialog).findByRole('button', { name: /export to json/i });
  expect(exportButton).toBeDisabled();
});

test('export dialog is openable again after json export finished', async () => {
  render(<Pages />);
  await userEvent.click(screen.getByLabelText(/show more options/i));
  await userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to json/i));
  await waitForElementToBeRemoved(dialog);
  await userEvent.click(screen.getByText(/export to json/i));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('pages can be exported to Google Docs if start/end dates specified', async () => {
  render(<Pages />);
  await userEvent.click(screen.getByLabelText(/show more options/i));
  await userEvent.click(screen.getByText(/export to google docs/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to google docs/i));
  await waitForElementToBeRemoved(dialog);
});

test('export dialog is openable again after google docs export finished', async () => {
  render(<Pages />);
  await userEvent.click(screen.getByLabelText(/show more options/i));
  await userEvent.click(screen.getByText(/export to google docs/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to google docs/i));
  await waitForElementToBeRemoved(dialog);
  await userEvent.click(screen.getByText(/export to google docs/i));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
