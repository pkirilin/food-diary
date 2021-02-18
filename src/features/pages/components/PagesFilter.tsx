import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, makeStyles, Paper } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useTypedSelector } from '../../__shared__/hooks';
import { endDateChanged, filterReset, startDateChanged } from '../slice';

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

  const filter = useTypedSelector(state => state.pages.filter);

  const dispatch = useDispatch();

  const initialStartDate = filter.startDate || null;
  const initialEndDate = filter.endDate || null;
  const initialSortOrder = filter.sortOrder;

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [, setSortOrder] = useState(initialSortOrder);

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setSortOrder(initialSortOrder);
  }, [initialStartDate, initialEndDate, initialSortOrder]);

  const handleResetClick = (): void => {
    dispatch(filterReset());
  };

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
          value={startDate}
          onChange={date => {
            dispatch(startDateChanged(date?.toISOString()));
          }}
        />
        <KeyboardDatePicker
          disableToolbar
          fullWidth
          variant="inline"
          format="dd.MM.yyyy"
          margin="normal"
          label="End date"
          value={endDate}
          onChange={date => {
            dispatch(endDateChanged(date?.toISOString()));
          }}
        />
      </MuiPickersUtilsProvider>
      <Box mt={2} className={classes.controls}>
        <Button
          variant="text"
          color="default"
          disabled={!filter.changed}
          onClick={handleResetClick}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
