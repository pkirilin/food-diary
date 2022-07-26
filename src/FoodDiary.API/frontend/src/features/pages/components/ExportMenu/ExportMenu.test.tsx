import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';
import { create } from 'src/test-utils';
import ExportMenu from './ExportMenu';

type MockedReactGoogleLogin = {
  useGoogleLogin: typeof useGoogleLogin;
};

// TODO: figure out how to do typesafe mock better
jest.mock(
  'react-google-login',
  (): MockedReactGoogleLogin => ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useGoogleLogin: ({ onSuccess = () => {} }) => ({
      signIn: () => {
        onSuccess({ accessToken: 'test_access_token' } as GoogleLoginResponse);
      },
      loaded: true,
    }),
  }),
);

test('pages can be exported to JSON if start/end dates specified', async () => {
  const ui = create
    .component(<ExportMenu />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByLabelText(/export pages/i));
  await userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to json/i));
  await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
  await waitForElementToBeRemoved(dialog);
});

test('pages can be exported to Google Docs if start/end dates specified', async () => {
  const ui = create
    .component(<ExportMenu />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByLabelText(/export pages/i));
  await userEvent.click(screen.getByText(/export to google docs/i));

  const dialog = screen.getByRole('dialog');

  const startDate = within(dialog).getByRole('textbox', { name: /start date/i });
  await userEvent.clear(startDate);
  await userEvent.type(startDate, '01012022');

  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '31012022');

  await userEvent.click(within(dialog).getByText(/export to google docs/i));
  await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
  await waitForElementToBeRemoved(dialog);
});

test('pages cannot be exported if start/end dates not specified', async () => {
  const ui = create
    .component(<ExportMenu />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByLabelText(/export pages/i));
  await userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');
  const endDate = within(dialog).getByRole('textbox', { name: /end date/i });
  await userEvent.clear(endDate);
  await userEvent.type(endDate, '01012022');

  expect(within(dialog).getByText(/export to json/i)).toBeDisabled();
});

test('export dialog is openable again after google docs export finished', async () => {
  const ui = create
    .component(<ExportMenu />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByLabelText(/export pages/i));
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

test('export dialog is openable again after json export finished', async () => {
  const ui = create
    .component(<ExportMenu />)
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByLabelText(/export pages/i));
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
