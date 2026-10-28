import { CssBaseline, ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { type Store } from '@reduxjs/toolkit';
import { type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { type PropsWithChildren, type FC } from 'react';
import { Provider } from 'react-redux';
import { theme } from './theme';

const dateLocale: Locale = { ...enUS, options: { ...enUS.options, weekStartsOn: 1 } };

interface Props {
  store: Store;
}

export const RootProvider: FC<PropsWithChildren<Props>> = ({ children, store }) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
          <Provider store={store}>
            <CssBaseline />
            {children}
          </Provider>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
