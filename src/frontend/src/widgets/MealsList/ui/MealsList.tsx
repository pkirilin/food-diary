import { List, Stack } from '@mui/material';
import { type FC, useMemo, type PropsWithChildren } from 'react';
import { noteLib, type noteModel } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface Props extends PropsWithChildren {
  notes: noteModel.NoteItem[];
  pageId: number;
}

const MEAL_TYPES = noteLib.getMealTypes();

export const MealsList: FC<Props> = ({ notes, pageId }: Props) => {
  const notesGroupedByMealType = useMemo(() => noteLib.groupByMealType(notes), [notes]);

  return (
    <Stack spacing={4} component={List} disablePadding>
      {MEAL_TYPES.map(mealType => (
        <MealsListItem
          key={mealType}
          pageId={pageId}
          mealType={mealType}
          notes={notesGroupedByMealType.get(mealType) ?? []}
        />
      ))}
    </Stack>
  );
};
