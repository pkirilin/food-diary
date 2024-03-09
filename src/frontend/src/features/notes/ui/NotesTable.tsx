import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { useRouterId } from 'src/hooks';
import { useProductSelect } from '../model';
import { type NoteItem, type MealType } from '../models';
import { AddNote } from './AddNote';
import { NotesTableRow } from './NotesTableRow';

interface NotesTableProps {
  mealType: MealType;
  notes: NoteItem[];
  notesChanged: boolean;
  notesFetching: boolean;
}

export const NotesTable: FC<NotesTableProps> = ({
  mealType,
  notes,
  notesChanged,
  notesFetching,
}: NotesTableProps) => {
  const pageId = useRouterId('id');
  const productSelect = useProductSelect();

  const maxDisplayOrderForNotesGroup = useMemo(
    () =>
      notes.reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
    [notes],
  );

  return (
    <TableContainer>
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
              notesChanged={notesChanged}
              notesFetching={notesFetching}
            />
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <AddNote
          pageId={pageId}
          mealType={mealType}
          displayOrder={maxDisplayOrderForNotesGroup + 1}
        />
      </Box>
    </TableContainer>
  );
};
