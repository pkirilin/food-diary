import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { ButtonBase, Popover, Typography } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { useSubmit } from 'react-router-dom';
import { dateLib } from '@/shared/lib';

interface Props {
  currentDate: Date;
}

export const SelectDate: FC<Props> = ({ currentDate }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const id = anchorEl ? 'select-date-popover' : undefined;
  const submit = useSubmit();

  return (
    <>
      <ButtonBase
        onClick={event => {
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
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={currentDate}
          views={['year', 'month', 'day']}
          onAccept={newDate => {
            if (newDate) {
              submit(new URLSearchParams({ date: dateLib.formatToISOStringWithoutTime(newDate) }), {
                method: 'GET',
                action: '/',
              });
              setAnchorEl(null);
            }
          }}
        />
      </Popover>
    </>
  );
};
