import React, { useMemo } from 'react';
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
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { MealType } from '../models';
import NotesTableRow from './NotesTableRow';
import { useTypedSelector } from '../../__shared__/hooks';

type NotesTableProps = {
  mealType: MealType;
};

const NotesTable: React.FC<NotesTableProps> = ({ mealType }: NotesTableProps) => {
  const noteItems = useTypedSelector(state =>
    state.notes.noteItems.filter(n => n.mealType === mealType),
  );

  const totalCalories = useMemo(() => noteItems.reduce((sum, note) => sum + note.calories, 0), [
    noteItems,
  ]);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Calories</TableCell>
            <TableCell padding="checkbox"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {noteItems.map(note => (
            <NotesTableRow key={note.id} note={note}></NotesTableRow>
          ))}
        </TableBody>
      </Table>
      <Box mt={1}>
        <Button variant="text" size="medium" fullWidth startIcon={<AddIcon></AddIcon>}>
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
