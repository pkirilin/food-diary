import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { type FC, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useRouterId } from 'src/hooks';
import { type NoteCreateEdit, type NoteItem } from '../models';
import { deleteNote, editNote } from '../thunks';
import DeleteNoteDialog from './DeleteNoteDialog';
import NoteInputDialog from './NoteInputDialog';

interface NotesTableRowProps {
  note: NoteItem;
}

const useStyles = makeStyles(theme => ({
  rowActions: {
    display: 'flex',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const NotesTableRow: FC<NotesTableRowProps> = ({ note }: NotesTableRowProps) => {
  const classes = useStyles();
  const pageId = useRouterId('id');
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => state.notes.operationStatusesByMealType[note.mealType]);

  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  useEffect(() => {
    if (status === 'succeeded') {
      setIsEditDialogOpened(false);
      setIsDeleteDialogOpened(false);
    }
  }, [status]);

  const handleEditOpen = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleEditClose = (): void => {
    setIsEditDialogOpened(false);
  };

  const handleEditSubmit = (noteData: NoteCreateEdit): void => {
    void dispatch(
      editNote({
        id: note.id,
        mealType: noteData.mealType,
        note: noteData,
      }),
    );
  };

  const handleDeleteOpen = (): void => {
    setIsDeleteDialogOpened(true);
  };

  const handleDeleteClose = (): void => {
    setIsDeleteDialogOpened(false);
  };

  const handleDeleteSubmit = ({ id, mealType }: NoteItem): void => {
    void dispatch(
      deleteNote({
        id,
        mealType,
      }),
    );
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
      <DeleteNoteDialog
        note={note}
        isOpened={isDeleteDialogOpened}
        isLoading={status === 'pending'}
        onClose={handleDeleteClose}
        onSubmit={handleDeleteSubmit}
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
          <IconButton size="small" onClick={handleDeleteOpen}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default NotesTableRow;
