import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useDialog, useRouterId } from 'src/hooks';
import { ConfirmationDialog } from '../../__shared__/components';
import { NoteCreateEdit, NoteItem } from '../models';
import { deleteNote, editNote } from '../thunks';
import NoteInputDialog from './NoteInputDialog';

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

  const noteDeleteDialog = useDialog(() => {
    dispatch(
      deleteNote({
        id: note.id,
        mealType: note.mealType,
      }),
    );
  });

  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);

  const status = useAppSelector(state => state.notes.operationStatusesByMealType[note.mealType]);

  useEffect(() => {
    if (status === 'succeeded') {
      setIsEditDialogOpened(false);
    }
  }, [status]);

  const handleEditOpen = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleEditClose = (): void => {
    setIsEditDialogOpened(false);
  };

  const handleEditSubmit = (noteData: NoteCreateEdit): void => {
    dispatch(
      editNote({
        id: note.id,
        mealType: noteData.mealType,
        note: noteData,
      }),
    );
  };

  const handleDeleteClick = (): void => {
    noteDeleteDialog.show();
  };

  return (
    <TableRow>
      <NoteInputDialog
        title="Edit note"
        submitText="Save"
        isOpened={isEditDialogOpened}
        mealType={note.mealType}
        pageId={pageId}
        product={{
          id: note.productId,
          name: note.productName,
        }}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
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
          <IconButton size="small" onClick={handleEditOpen}>
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
