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
  Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import {
  useAppDispatch,
  useDialog,
  useRefreshEffect,
  useRouterId,
  useAppSelector,
} from '../../__shared__/hooks';
import { MealType, NoteCreateEdit } from '../models';
import { createNote, getNotes } from '../thunks';
import NoteCreateEditDialog from './NoteCreateEditDialog';
import NotesTableRow from './NotesTableRow';

type NotesTableProps = {
  mealType: MealType;
};

const NotesTable: React.FC<NotesTableProps> = ({ mealType }: NotesTableProps) => {
  const pageId = useRouterId('id');

  const noteItems = useAppSelector(state =>
    state.notes.noteItems.filter(n => n.mealType === mealType),
  );

  const totalCalories = useMemo(
    () => noteItems.reduce((sum, note) => sum + note.calories, 0),
    [noteItems],
  );

  const dispatch = useAppDispatch();

  const noteCreateDialog = useDialog<NoteCreateEdit>(note => {
    dispatch(
      createNote({
        mealType,
        note,
      }),
    );
  });

  useRefreshEffect(
    state => state.notes.operationStatusesByMealType[mealType],
    () => {
      dispatch(
        getNotes({
          pageId,
          mealType,
        }),
      );
    },
    [pageId, mealType],
    false,
  );

  const handleAddNoteClick = (): void => {
    noteCreateDialog.show();
  };

  return (
    <TableContainer>
      <NoteCreateEditDialog {...noteCreateDialog.binding} mealType={mealType} pageId={pageId} />
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
          {noteItems.map(note => (
            <NotesTableRow key={note.id} note={note} />
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <Button
          variant="text"
          size="medium"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleAddNoteClick}
        >
          Add note
        </Button>
      </Box>
      <Box mt={2}>
        <Typography variant="subtitle1" align="right">
          Total calories: {totalCalories}
        </Typography>
      </Box>
    </TableContainer>
  );
};

export default NotesTable;