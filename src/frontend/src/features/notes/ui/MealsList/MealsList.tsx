import { List, Stack } from '@mui/material';
import { type FC, useMemo, type PropsWithChildren } from 'react';
import { type NoteItem, getMealTypes, groupNotesByMealType } from '../../models';
import { MealsListItem } from './MealsListItem';

interface Props extends PropsWithChildren {
  notes: NoteItem[];
  pageId: number;
}

const MEAL_TYPES = getMealTypes();

export const MealsList: FC<Props> = ({ notes, pageId }: Props) => {
  const notesGroupedByMealType = useMemo(() => groupNotesByMealType(notes), [notes]);

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
