import DeleteIcon from '@mui/icons-material/Delete';
import { ListItem, IconButton, ListItemButton, ListItemText } from '@mui/material';
import { type FC } from 'react';
import { type NoteItem } from '../models';
import { EditNote } from './EditNote';

interface Props {
  note: NoteItem;
  pageId: number;
}

export const NotesListItem: FC<Props> = ({ note, pageId }) => {
  return (
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
      <EditNote note={note} pageId={pageId}>
        {toggleEditDialog => (
          <ListItemButton onClick={toggleEditDialog}>
            <ListItemText
              primary={note.productName}
              secondary={`${note.productQuantity} g, ${note.calories} kcal`}
            />
          </ListItemButton>
        )}
      </EditNote>
    </ListItem>
  );
};
