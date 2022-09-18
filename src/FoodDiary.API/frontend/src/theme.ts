import { createTheme } from '@mui/material';
import { green, lightGreen } from '@mui/material/colors';

export default createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: lightGreen[700],
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
      fontWeight: 400,
    },
  },
});
