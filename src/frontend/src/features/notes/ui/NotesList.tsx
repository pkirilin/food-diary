import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { type NoteItem } from '../models';

interface Props {
  notes: NoteItem[];
}

export const NotesList: FC<Props> = ({ notes }) => (
  <List sx={{ width: '100%' }}>
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
