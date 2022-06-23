import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type DateChangedAction = typeof startDateChanged | typeof endDateChanged;

function useFilter() {
  const [isInitialized, setIsInitialized] = useState(false);
  const filterStartDate = useAppSelector(state => state.pages.filter.startDate || null);
  const filterEndDate = useAppSelector(state => state.pages.filter.endDate || null);
  const isChanged = useAppSelector(state => state.pages.filter.changed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const initialStartDate = useMemo(
    () => (filterStartDate ? new Date(filterStartDate) : null),
    [filterStartDate],
  );

  const initialEndDate = useMemo(
    () => (filterEndDate ? new Date(filterEndDate) : null),
    [filterEndDate],
  );

  function reset() {
    dispatch(filterReset());
  }

  const applyToDatePart = useCallback(
    (date: Date | null, dateChangedAction: DateChangedAction) => {
      if (!isInitialized) {
        return;
      }

      if (!validateFilterDate(date)) {
        return;
      }

      if (date === null) {
        dispatch(dateChangedAction());
        return;
      }

      dispatch(dateChangedAction(dateFnsFormat(date, 'yyyy-MM-dd')));
    },
    [dispatch, isInitialized],
  );

  return {
    initialStartDate,
    initialEndDate,
    isChanged,
    applyToDatePart,
    reset,
  };
}

const PagesFilter: React.FC = () => {
  const classes = useFilterStyles();
  const { initialStartDate, initialEndDate, isChanged, applyToDatePart, reset } = useFilter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    applyToDatePart(startDate, startDateChanged);
    applyToDatePart(endDate, endDateChanged);
  }, [applyToDatePart, startDate, endDate]);

  useEffect(() => {
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate]);

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
        <Button variant="text" disabled={!isChanged} onClick={reset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
