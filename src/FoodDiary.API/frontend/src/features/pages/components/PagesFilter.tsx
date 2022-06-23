import React, { useEffect, useState } from 'react';
import { Box, Button, Paper } from '@mui/material';
import dateFnsFormat from 'date-fns/format';
import isValid from 'date-fns/isValid';
import { endDateChanged, filterReset, startDateChanged } from '../slice';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { DatePicker } from 'src/components';

function validateFilterDate(date: Date | null) {
  if (date === null) {
    return false;
  }

  if (!isValid(date)) {
    return false;
  }

  if (date.getFullYear().toString().length < 4) {
    return false;
  }

  return true;
}

const PagesFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterStartDate = useAppSelector(state => state.pages.filter.startDate || null);
  const filterEndDate = useAppSelector(state => state.pages.filter.endDate || null);
  const filterChanged = useAppSelector(state => state.pages.filter.changed);
  const dispatch = useAppDispatch();

  const initialStartDate = filterStartDate ? new Date(filterStartDate) : null;
  const initialEndDate = filterEndDate ? new Date(filterEndDate) : null;
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!validateFilterDate(startDate)) {
      return;
    }

    if (startDate === null) {
      dispatch(startDateChanged());
      return;
    }

    dispatch(startDateChanged(dateFnsFormat(startDate, 'yyyy-MM-dd')));
  }, [dispatch, isInitialized, startDate]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!validateFilterDate(endDate)) {
      return;
    }

    if (endDate === null) {
      dispatch(endDateChanged());
      return;
    }

    dispatch(endDateChanged(dateFnsFormat(endDate, 'yyyy-MM-dd')));
  }, [dispatch, isInitialized, endDate]);

  return (
    <Box component={Paper} className={classes.root}>
      <DatePicker
        label="Start date"
        placeholder="Select start date"
        date={startDate}
        onChange={value => setStartDate(value)}
      ></DatePicker>
      <DatePicker
        label="End date"
        placeholder="Select end date"
        date={endDate}
        onChange={value => setEndDate(value)}
      ></DatePicker>
      <Box className={classes.controls}>
        <Button
          variant="text"
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
