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

type UseValidatedStateOptions<T> = {
  initialValue: T;
  errorHelperText: string;
  validatorFunction: (value: T) => boolean;
};

function useValidatedState<T>({
  initialValue,
  errorHelperText,
  validatorFunction,
}: UseValidatedStateOptions<T>) {
  const [value, originalSetValue] = useState<T>(initialValue);
  const [helperText, setHelperText] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validatorFunction(value);
      const helperText = isInvalid ? errorHelperText : '';
      setIsInvalid(isInvalid);
      setHelperText(helperText);
    }
  }, [errorHelperText, isTouched, validatorFunction, value]);

  function setValue(newValue: T) {
    originalSetValue(newValue);
    setIsTouched(true);
  }

  return {
    value,
    setValue,
    helperText,
    isInvalid,
    isTouched,
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
    validatorFunction: validateFilterDate,
  });

  const {
    value: endDate,
    setValue: setEndDate,
    isInvalid: isEndDateInvalid,
    helperText: endDateHelperText,
  } = useValidatedState<Date | null>({
    initialValue: null,
    errorHelperText: 'End date is required',
    validatorFunction: validateFilterDate,
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
        isValid={!isStartDateInvalid}
        helperText={startDateHelperText}
      ></DatePicker>
      <DatePicker
        label="End date"
        placeholder="Select end date"
        date={endDate}
        onChange={value => setEndDate(value)}
        isValid={!isEndDateInvalid}
        helperText={endDateHelperText}
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
