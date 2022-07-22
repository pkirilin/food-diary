import React from 'react';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NoteCreateEdit, NoteItem } from '../models';
import { useAppDispatch, useDialog, useRouterId } from '../../__shared__/hooks';
import NoteCreateEditDialog from './NoteCreateEditDialog';
import { ConfirmationDialog } from '../../__shared__/components';
import { deleteNote, editNote } from '../thunks';

type NotesTableRowProps = {
  note: NoteItem;
};

const useStyles = makeStyles(theme => ({
  rowActions: {
    display: 'flex',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const NotesTableRow: React.FC<NotesTableRowProps> = ({ note }: NotesTableRowProps) => {
  const classes = useStyles();
  const pageId = useRouterId('id');

  const dispatch = useAppDispatch();

  const noteEditDialog = useDialog<NoteCreateEdit>(noteData => {
    dispatch(
      editNote({
        id: note.id,
        note: { ...noteData },
        mealType: noteData.mealType,
      }),
    );
  });

  const noteDeleteDialog = useDialog(() => {
    dispatch(
      deleteNote({
        id: note.id,
        mealType: note.mealType,
      }),
    );
  });

  const handleEditClick = (): void => {
    noteEditDialog.show();
  };

  const handleDeleteClick = (): void => {
    noteDeleteDialog.show();
  };

  return (
    <TableRow>
      <NoteCreateEditDialog
        {...noteEditDialog.binding}
        mealType={note.mealType}
        pageId={pageId}
        note={note}
      />
      <ConfirmationDialog
        {...noteDeleteDialog.binding}
        dialogTitle="Delete note"
        dialogMessage={`Are you sure you want to delete this note: ${note.productName}, ${note.productQuantity} g, ${note.calories} cal?`}
      />
      <TableCell>{note.productName}</TableCell>
      <TableCell>{note.productQuantity}</TableCell>
      <TableCell>{note.calories}</TableCell>
      <TableCell className={classes.rowActions}>
        <Tooltip title="Edit note">
          <IconButton size="small" onClick={handleEditClick}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete note">
          <IconButton size="small" onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default NotesTableRow;
