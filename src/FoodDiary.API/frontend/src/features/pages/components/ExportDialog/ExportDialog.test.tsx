import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';

import { create } from 'src/test-utils';
import ExportDialog from './ExportDialog';

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

test('export to JSON button is disabled for incorrect date periods', async () => {
  const ui = create
    .component(<ExportDialog format="json" isOpen={true} onClose={jest.fn()}></ExportDialog>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);

  userEvent.type(screen.getByLabelText(/export end date/i), '01.01.2022');

  expect(screen.getByText(/export to json/i).parentElement).toBeDisabled();
});

test('export to Google Docs button is disabled for incorrect date periods', () => {
  const ui = create
    .component(<ExportDialog format="google docs" isOpen={true} onClose={jest.fn()}></ExportDialog>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);

  userEvent.type(screen.getByLabelText(/export start date/i), '01.01.2022');

  expect(screen.getByText(/export to google docs/i).parentElement).toBeDisabled();
});

test('exports pages to JSON', async () => {
  const onCloseFn = jest.fn();

  const ui = create
    .component(<ExportDialog format="json" isOpen={true} onClose={onCloseFn}></ExportDialog>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.type(screen.getByLabelText(/export start date/i), '01.01.2022');
  userEvent.type(screen.getByLabelText(/export end date/i), '31.01.2022');
  userEvent.click(screen.getByText(/export to json/i));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(onCloseFn).toHaveBeenCalled();
});

test('exports pages to Google Docs', async () => {
  const onCloseFn = jest.fn();

  const ui = create
    .component(<ExportDialog format="google docs" isOpen={true} onClose={onCloseFn}></ExportDialog>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.type(screen.getByLabelText(/export start date/i), '01.01.2022');
  userEvent.type(screen.getByLabelText(/export end date/i), '31.01.2022');
  userEvent.click(screen.getByText(/export to google docs/i));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(onCloseFn).toHaveBeenCalled();
});
