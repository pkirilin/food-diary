import { List, Stack } from '@mui/material';
import { type FC, useMemo, type PropsWithChildren } from 'react';
import { type NoteItem, noteLib } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface Props extends PropsWithChildren {
  notes: NoteItem[];
  date: string;
}

const MEAL_TYPES = noteLib.getMealTypes();

export const MealsList: FC<Props> = ({ notes, date }: Props) => {
  const notesGroupedByMealType = useMemo(() => noteLib.groupByMealType(notes), [notes]);

  return (
    <Stack spacing={4} component={List} disablePadding>
      {MEAL_TYPES.map(mealType => (
        <MealsListItem
          key={mealType}
          date={date}
          mealType={mealType}
          notes={notesGroupedByMealType.get(mealType) ?? []}
        />
      ))}
    </Stack>
  );
};
