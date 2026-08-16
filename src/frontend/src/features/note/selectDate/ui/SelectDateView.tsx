import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { ButtonBase, DialogActions, Popover, Typography } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { dateLib } from '@/shared/lib';
import { Button } from '@/shared/ui';

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
          slotProps={{ actionBar: { actions: [] } }}
        />
        <DialogActions>
          <Button onClick={closePopover}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmitDate(selectedDate);
              closePopover();
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Popover>
    </>
  );
};
