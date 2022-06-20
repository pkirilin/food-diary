// import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { GoogleLoginResponse, useGoogleLogin } from 'react-google-login';

// import { create } from 'src/test-utils';
// import ExportMenu from './ExportMenu';

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

// TODO: fix tests after Material 5 migration
// https://github.com/mui/material-ui/issues/27038
// https://github.com/mui/material-ui-pickers/issues/2073

test('', () => {
  //
});

// test('pages can be exported to JSON if start/end dates specified', async () => {
//   const ui = create
//     .component(<ExportMenu></ExportMenu>)
//     .withReduxStore()
//     .withMuiPickersUtils()
//     .please();

//   render(ui);
//   await userEvent.click(screen.getByLabelText(/export pages/i));
//   await userEvent.click(screen.getByText(/export to json/i));

//   const dialog = screen.getByRole('dialog');
//   await userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
//   await userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
//   await userEvent.click(within(dialog).getByText(/export to json/i));

//   await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
//   await waitForElementToBeRemoved(dialog);
// });

// test('pages can be exported to Google Docs if start/end dates specified', async () => {
//   const ui = create
//     .component(<ExportMenu></ExportMenu>)
//     .withReduxStore()
//     .withMuiPickersUtils()
//     .please();

//   render(ui);
//   await userEvent.click(screen.getByLabelText(/export pages/i));
//   await userEvent.click(screen.getByText(/export to google docs/i));

//   const dialog = screen.getByRole('dialog');
//   await userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
//   await userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
//   await userEvent.click(within(dialog).getByText(/export to google docs/i));

//   await waitForElementToBeRemoved(within(dialog).getByRole('progressbar'));
//   await waitForElementToBeRemoved(dialog);
// });

// test('pages cannot be exported if start/end dates not specified', async () => {
//   const ui = create
//     .component(<ExportMenu></ExportMenu>)
//     .withReduxStore()
//     .withMuiPickersUtils()
//     .please();

//   render(ui);
//   await userEvent.click(screen.getByLabelText(/export pages/i));
//   await userEvent.click(screen.getByText(/export to json/i));
//   const dialog = screen.getByRole('dialog');
//   await userEvent.type(within(dialog).getByLabelText(/export end date/i), '01.01.2022');

//   expect(within(dialog).getByText(/export to json/i)).toBeDisabled();
// });

// test('export dialog is openable again after google docs export finished', async () => {
//   const ui = create
//     .component(<ExportMenu></ExportMenu>)
//     .withReduxStore()
//     .withMuiPickersUtils()
//     .please();

//   render(ui);
//   await userEvent.click(screen.getByLabelText(/export pages/i));
//   await userEvent.click(screen.getByText(/export to google docs/i));

//   const dialog = screen.getByRole('dialog');
//   await userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
//   await userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
//   await userEvent.click(within(dialog).getByText(/export to google docs/i));

//   await waitForElementToBeRemoved(dialog);
//   await userEvent.click(screen.getByText(/export to google docs/i));

//   expect(screen.getByRole('dialog')).toBeInTheDocument();
// });

// test('export dialog is openable again after json export finished', async () => {
//   const ui = create
//     .component(<ExportMenu></ExportMenu>)
//     .withReduxStore()
//     .withMuiPickersUtils()
//     .please();

//   render(ui);
//   await userEvent.click(screen.getByLabelText(/export pages/i));
//   await userEvent.click(screen.getByText(/export to json/i));

//   const dialog = screen.getByRole('dialog');
//   await userEvent.type(within(dialog).getByLabelText(/export start date/i), '01.01.2022');
//   await userEvent.type(within(dialog).getByLabelText(/export end date/i), '31.01.2022');
//   await userEvent.click(within(dialog).getByText(/export to json/i));

//   await waitForElementToBeRemoved(dialog);
//   await userEvent.click(screen.getByText(/export to json/i));

//   expect(screen.getByRole('dialog')).toBeInTheDocument();
// });
