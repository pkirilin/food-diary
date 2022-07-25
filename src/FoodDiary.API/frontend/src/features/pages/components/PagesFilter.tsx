import { Box, Button, Paper } from '@mui/material';
import dateFnsFormat from 'date-fns/format';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker } from 'src/components';
import { useValidatedState } from 'src/hooks';
import { validateDate } from 'src/utils';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { endDateChanged, filterReset, startDateChanged } from '../slice';

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

      if (!validateDate(date)) {
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

  const {
    value: startDate,
    setValue: setStartDate,
    isInvalid: isStartDateInvalid,
    helperText: startDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'Start date is required',
    validatorFunction: validateDate,
  });

  const {
    value: endDate,
    setValue: setEndDate,
    isInvalid: isEndDateInvalid,
    helperText: endDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'End date is required',
    validatorFunction: validateDate,
  });

  useEffect(() => {
    applyToDatePart(startDate, startDateChanged);
    applyToDatePart(endDate, endDateChanged);
  }, [applyToDatePart, startDate, endDate]);

  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate);
    }

    if (initialEndDate) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate, setStartDate, setEndDate]);

  return (
    <Box component={Paper} className={classes.root}>
      <DatePicker
        label="Start date"
        placeholder="Select start date"
        date={startDate}
        onChange={value => setStartDate(value)}
        isInvalid={isStartDateInvalid}
        helperText={startDateHelperText}
      />
      <DatePicker
        label="End date"
        placeholder="Select end date"
        date={endDate}
        onChange={value => setEndDate(value)}
        isInvalid={isEndDateInvalid}
        helperText={endDateHelperText}
      />
      <Box className={classes.controls}>
        <Button variant="text" disabled={!isChanged} onClick={reset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
