import { createTheme } from '@mui/material';
import { green } from '@mui/material/colors';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ThemeOptions {}
}

export default createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: green[600],
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
  },
});
