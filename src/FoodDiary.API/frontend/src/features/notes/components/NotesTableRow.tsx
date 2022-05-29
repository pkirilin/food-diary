import React from 'react';
import { IconButton, makeStyles, TableCell, TableRow, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
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
      ></NoteCreateEditDialog>
      <ConfirmationDialog
        {...noteDeleteDialog.binding}
        dialogTitle="Delete note"
        dialogMessage={`Are you sure you want to delete this note: ${note.productName}, ${note.productQuantity} g, ${note.calories} cal?`}
      ></ConfirmationDialog>
      <TableCell>{note.productName}</TableCell>
      <TableCell>{note.productQuantity}</TableCell>
      <TableCell>{note.calories}</TableCell>
      <TableCell className={classes.rowActions}>
        <Tooltip title="Edit note">
          <IconButton size="small" onClick={handleEditClick}>
            <EditIcon fontSize="small"></EditIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete note">
          <IconButton size="small" onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small"></DeleteIcon>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default NotesTableRow;
