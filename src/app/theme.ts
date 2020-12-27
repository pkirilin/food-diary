import { createMuiTheme } from '@material-ui/core';
import { green, lightGreen } from '@material-ui/core/colors';

export default createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: lightGreen[800],
    },
    secondary: {
      main: green[100],
    },
  },
});
