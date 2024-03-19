import DeleteIcon from '@mui/icons-material/Delete';
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { getMealName, type MealType, type NoteItem } from '../models';

interface Props {
  mealType: MealType;
  notes: NoteItem[];
}

export const NotesList: FC<Props> = ({ mealType, notes }) => {
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
      sx={{ width: '100%' }}
    >
      {notes.map(note => (
        <ListItem
          disableGutters
          disablePadding
          key={note.id}
          secondaryAction={
            <IconButton>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton>
            <ListItemText
              primary={note.productName}
              secondary={`${note.productQuantity} g, ${note.calories} kcal`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};
