import { createTheme } from '@material-ui/core';
import { green, lightGreen } from '@material-ui/core/colors';

export default createTheme({
  palette: {
    type: 'light',
    primary: {
      main: lightGreen[800],
      contrastText: lightGreen[50],
    },
    secondary: {
      main: green[100],
      contrastText: green[900],
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 350,
    },
  },
});
