import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { ButtonBase, Popover, Typography } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { dateLib } from '@/shared/lib';

export type OnSubmitDateFn = (date: Date) => void;

interface Props {
  currentDate: Date;
  onSubmitDate: OnSubmitDateFn;
}

export const SelectDateView: FC<Props> = ({ currentDate, onSubmitDate }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const id = anchorEl ? 'select-date-popover' : undefined;

  const closePopover = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <ButtonBase
        onClick={event => {
          setSelectedDate(currentDate);
          setAnchorEl(event.currentTarget);
        }}
      >
        <Typography variant="h6" component="div">
          {dateLib.formatToUserFriendlyString(currentDate)}
        </Typography>
        {anchorEl ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </ButtonBase>
      <Popover
        id={id}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={selectedDate}
          views={['year', 'month', 'day']}
          onChange={newDate => {
            if (newDate) {
              setSelectedDate(newDate);
            }
          }}
          onAccept={newDate => {
            if (newDate) {
              onSubmitDate(newDate);
              closePopover();
            }
          }}
          onClose={closePopover}
        />
      </Popover>
    </>
  );
};
