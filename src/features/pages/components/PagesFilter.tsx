import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { endDateChanged, filterReset, startDateChanged } from '../slice';
import { useTypedSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';

const PagesFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterStartDate = useTypedSelector(state => state.pages.filter.startDate || null);
  const filterEndDate = useTypedSelector(state => state.pages.filter.endDate || null);
  const filterChanged = useTypedSelector(state => state.pages.filter.changed);

  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(filterStartDate);
  const [endDate, setEndDate] = useState(filterEndDate);

  useEffect(() => {
    setStartDate(filterStartDate);
  }, [filterStartDate]);

  useEffect(() => {
    setEndDate(filterEndDate);
  }, [filterEndDate]);

  return (
    <Box component={Paper} className={classes.root}>
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
      <Box className={classes.controls}>
        <Button
          variant="text"
          color="default"
          disabled={!filterChanged}
          onClick={() => {
            dispatch(filterReset());
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
