import { List, ListItem } from '@mui/material';
import { type FC, useMemo, type PropsWithChildren } from 'react';
import { type NoteItem, getMealTypes, groupNotesByMealType } from '../models';
import { NotesList } from './NotesList';

interface Props extends PropsWithChildren {
  notes: NoteItem[];
}

const MEAL_TYPES = getMealTypes();

export const MealsList: FC<Props> = ({ notes }: Props) => {
  const notesGroupedByMealType = useMemo(() => groupNotesByMealType(notes), [notes]);

  return (
    <List>
      {MEAL_TYPES.map(mealType => (
        <ListItem key={mealType} disableGutters>
          <NotesList mealType={mealType} notes={notesGroupedByMealType.get(mealType) ?? []} />
        </ListItem>
      ))}
    </List>
  );
};
