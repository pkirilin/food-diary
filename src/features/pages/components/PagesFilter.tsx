import React, { useEffect } from 'react';
import { Box, Button, makeStyles, Paper } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const useStyles = makeStyles(theme => ({
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const PagesFilter: React.FC = () => {
  const classes = useStyles();

  useEffect(() => {
    return;
  }, []);

  return (
    <Box p={2} component={Paper}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          disableToolbar
          fullWidth
          variant="inline"
          format="dd.MM.yyyy"
          margin="normal"
          label="Start date"
          value={new Date()}
          onChange={() => {
            //
          }}
        />
        <KeyboardDatePicker
          disableToolbar
          fullWidth
          variant="inline"
          format="dd.MM.yyyy"
          margin="normal"
          label="End date"
          value={new Date()}
          onChange={() => {
            //
          }}
        />
      </MuiPickersUtilsProvider>
      <Box mt={2} className={classes.controls}>
        <Button variant="contained" color="primary">
          Apply
        </Button>
        <Button variant="text" color="default">
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
