import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { type FC, useEffect, useState, useMemo } from 'react';
import { useRouterId } from 'src/hooks';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useProductSelect } from '../model';
import { type NoteItem, type MealType, type NoteCreateEdit } from '../models';
import NoteInputDialog from './NoteInputDialog';
import NotesTableRow from './NotesTableRow';

interface NotesTableProps {
  mealType: MealType;
  notes: NoteItem[];
}

const NotesTable: FC<NotesTableProps> = ({ mealType, notes }: NotesTableProps) => {
  const pageId = useRouterId('id');
  const productSelect = useProductSelect();
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [isDialogOpened, setIsDialogOpened] = useState(false);

  const maxDisplayOrderForNotesGroup = useMemo(
    () =>
      notes.reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
    [notes],
  );

  useEffect(() => {
    if (createNoteResponse.isSuccess) {
      setIsDialogOpened(false);
    }
  }, [createNoteResponse.isSuccess]);

  const handleDialogOpen = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleAddNote = (note: NoteCreateEdit): void => {
    const request = toCreateNoteRequest(note);
    void createNote(request);
  };

  return (
    <TableContainer>
      <NoteInputDialog
        title="New note"
        submitText="Create"
        isOpened={isDialogOpened}
        mealType={mealType}
        product={null}
        products={productSelect.data}
        productsLoading={productSelect.isLoading}
        quantity={100}
        pageId={pageId}
        displayOrder={maxDisplayOrderForNotesGroup + 1}
        onClose={handleDialogClose}
        onSubmit={handleAddNote}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Calories</TableCell>
            <TableCell padding="checkbox" />
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.map(note => (
            <NotesTableRow
              key={note.id}
              note={note}
              products={productSelect.data}
              productsLoading={productSelect.isLoading}
            />
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <Button
          variant="text"
          size="medium"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
        >
          Add note
        </Button>
      </Box>
    </TableContainer>
  );
};

export default NotesTable;
