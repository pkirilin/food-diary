import { type FC } from 'react';
import { useSubmit } from 'react-router';
import { dateLib } from '@/shared/lib';
import { SelectDateView } from './SelectDateView';

interface Props {
  currentDate: Date;
}

export const SelectDate: FC<Props> = ({ currentDate }) => {
  const submit = useSubmit();

  return (
    <SelectDateView
      currentDate={currentDate}
      onSubmitDate={date => {
        submit(new URLSearchParams({ date: dateLib.formatToISOStringWithoutTime(date) }), {
          method: 'GET',
          action: '/',
        });
      }}
    />
  );
};
