import { type SxProps, type Theme } from '@mui/material';
import {
  dateCalendarClasses,
  dayCalendarClasses,
  monthCalendarClasses,
  pickerDayClasses,
  yearCalendarClasses,
} from '@mui/x-date-pickers';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';

const DAY_CELL_MIN_SIZE = 48;
const DAYS_IN_WEEK = 7;
export const WEEKS_IN_GRID = 6;

const gridWidth = `calc(${DAYS_IN_WEEK} * var(--day-cell-size))`;

export const popoverSx: SxProps<Theme> = {
  '--app-bar-height': {
    xs: `${APP_BAR_HEIGHT_XS}px`,
    sm: `${APP_BAR_HEIGHT_SM}px`,
  },
};

export const paperSx: SxProps<Theme> = {
  '--day-cell-size': {
    xs: `max(${DAY_CELL_MIN_SIZE}px, calc(100vw / ${DAYS_IN_WEEK}))`,
    sm: `${DAY_CELL_MIN_SIZE}px`,
  },
  width: { xs: '100%', sm: gridWidth },
  maxWidth: '100%',
  maxHeight: 'calc(100% - var(--app-bar-height))',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
};

export const scrimBelowAppBarSx: SxProps<Theme> = {
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    top: 'var(--app-bar-height)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

export const calendarSx: SxProps<Theme> = {
  [`& .${dateCalendarClasses.root}, & .${monthCalendarClasses.root}, & .${yearCalendarClasses.root}`]:
    {
      width: gridWidth,
    },
  [`& .${dateCalendarClasses.root}`]: {
    height: 'auto',
    maxHeight: 'none',
  },
  [`& .${dayCalendarClasses.weekDayLabel}`]: {
    width: 'var(--day-cell-size)',
    margin: 0,
  },
  [`& .${dayCalendarClasses.weekContainer}`]: {
    margin: 0,
  },
  [`& .${dayCalendarClasses.slideTransition}`]: {
    minHeight: `calc(${WEEKS_IN_GRID} * var(--day-cell-size))`,
  },
  [`& .${pickerDayClasses.root}`]: {
    '--PickerDay-size': 'var(--day-cell-size)',
    '--PickerDay-horizontalMargin': 0,
  },
};
