import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';

import { create } from 'src/test-utils';
import PagesToolbar from './PagesToolbar';

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
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle(/export pages/i));
  userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');
  userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
  userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
  userEvent.click(within(dialog).getByText(/export to json/i));

  await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
  await waitForElementToBeRemoved(dialog);
});

test('pages can be exported to Google Docs if start/end dates specified', async () => {
  const ui = create
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle(/export pages/i));
  userEvent.click(screen.getByText(/export to google docs/i));

  const dialog = screen.getByRole('dialog');
  userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
  userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
  userEvent.click(within(dialog).getByText(/export to google docs/i));

  await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
  await waitForElementToBeRemoved(dialog);
});

test('pages cannot be exported if start/end dates not specified', async () => {
  const ui = create
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle(/export pages/i));
  userEvent.click(screen.getByText(/export to json/i));

  const dialog = screen.getByRole('dialog');
  userEvent.type(within(dialog).getByLabelText(/export end date/i), '01.01.2022');

  expect(within(dialog).getByText(/export to json/i).parentElement).toBeDisabled();
});
