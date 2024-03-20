import DeleteIcon from '@mui/icons-material/Delete';
import { ListItem, IconButton, ListItemButton, ListItemText, Tooltip, Grid } from '@mui/material';
import { type FC } from 'react';
import { type NoteItem } from '../models';
import { DeleteNote } from './DeleteNote';
import { EditNote } from './EditNote';

interface Props {
  note: NoteItem;
  pageId: number;
}

export const NotesListItem: FC<Props> = ({ note, pageId }) => (
  <Grid
    key={note.id}
    item
    xs={12}
    md={6}
    component={ListItem}
    disablePadding
    secondaryAction={
      <DeleteNote note={note} pageId={pageId}>
        {toggleDeleteDialog => (
          <Tooltip title="Delete note">
            <IconButton edge="end" onClick={toggleDeleteDialog}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </DeleteNote>
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
  </Grid>
);
