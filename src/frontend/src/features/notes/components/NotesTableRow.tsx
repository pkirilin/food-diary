import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { type FC, useEffect, useState } from 'react';
import { type ProductSelectOption } from 'src/features/products';
import { useRouterId } from 'src/hooks';
import { notesApi } from '../api';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';
import DeleteNoteDialog from './DeleteNoteDialog';
import NoteInputDialog from './NoteInputDialog';

interface NotesTableRowProps {
  note: NoteItem;
  products: ProductSelectOption[];
  productsLoading: boolean;
}

const useStyles = makeStyles(theme => ({
  rowActions: {
    display: 'flex',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const NotesTableRow: FC<NotesTableRowProps> = ({
  note,
  products,
  productsLoading,
}: NotesTableRowProps) => {
  const classes = useStyles();
  const pageId = useRouterId('id');

  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const [deleteNote, deleteNoteResponse] = notesApi.useDeleteNoteMutation();

  useEffect(() => {
    if (editNoteResponse.isSuccess) {
      setIsEditDialogOpened(false);
    }
  }, [editNoteResponse.isSuccess]);

  useEffect(() => {
    if (deleteNoteResponse.isSuccess) {
      setIsDeleteDialogOpened(false);
    }
  }, [deleteNoteResponse.isSuccess]);

  const handleEditOpen = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleEditClose = (): void => {
    setIsEditDialogOpened(false);
  };

  const handleEditSubmit = (noteData: NoteCreateEdit): void => {
    const request = toEditNoteRequest(note.id, noteData);
    void editNote(request);
  };

  const handleDeleteOpen = (): void => {
    setIsDeleteDialogOpened(true);
  };

  const handleDeleteClose = (): void => {
    setIsDeleteDialogOpened(false);
  };

  const handleDeleteSubmit = ({ id }: NoteItem): void => {
    void deleteNote(id);
  };

  return (
    <TableRow>
      <NoteInputDialog
        title="Edit note"
        submitText="Save"
        isOpened={isEditDialogOpened}
        mealType={note.mealType}
        pageId={pageId}
        product={toProductSelectOption(note)}
        products={products}
        productsLoading={productsLoading}
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
