import { List, ListItem, ListSubheader, Stack, Typography } from '@mui/material';
import { type FC, useMemo, type PropsWithChildren } from 'react';
import { getMealName, type NoteItem, type MealType } from '../models';
import { NotesList } from './NotesList';

interface Props extends PropsWithChildren {
  mealType: MealType;
  notes: NoteItem[];
}

export const MealsListItem: FC<Props> = ({ mealType, notes }: Props) => {
  const mealName = useMemo(() => getMealName(mealType), [mealType]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  return (
    <List
      subheader={
        <ListSubheader disableGutters>
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Typography fontSize="inherit" fontWeight="inherit" component="span" noWrap>
              {mealName}
            </Typography>
            <Typography
              fontSize="inherit"
              fontWeight="inherit"
              component="span"
              width={100}
              align="right"
            >
              {totalCalories} kcal
            </Typography>
          </Stack>
        </ListSubheader>
      }
    >
      <ListItem disableGutters>
        <NotesList notes={notes} />
      </ListItem>
    </List>
  );
};
