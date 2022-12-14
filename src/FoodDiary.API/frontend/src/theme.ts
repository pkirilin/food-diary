import { createTheme } from '@mui/material';
import { green } from '@mui/material/colors';

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
