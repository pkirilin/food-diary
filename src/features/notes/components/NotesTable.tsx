import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { MealType, NoteItem } from '../models';
import NotesTableRow from './NotesTableRow';

const noteItems: NoteItem[] = [
  {
    id: 1,
    mealType: MealType.Breakfast,
    displayOrder: 0,
    productId: 1,
    productName: 'Product 1',
    productQuantity: 100,
    calories: 100,
  },
  {
    id: 2,
    mealType: MealType.Breakfast,
    displayOrder: 0,
    productId: 1,
    productName: 'Product 1',
    productQuantity: 100,
    calories: 100,
  },
  {
    id: 3,
    mealType: MealType.Breakfast,
    displayOrder: 0,
    productId: 1,
    productName: 'Product 1',
    productQuantity: 100,
    calories: 100,
  },
];

const totalCalories = noteItems.reduce((sum, note) => sum + note.calories, 0);

const NotesTable: React.FC = () => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Calories</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {noteItems.map(note => (
            <NotesTableRow key={note.id} note={note}></NotesTableRow>
          ))}
        </TableBody>
      </Table>
      <Box mt={2}>
        <Typography variant="subtitle1" align="right">
          Total calories: {totalCalories}
        </Typography>
      </Box>
    </TableContainer>
  );
};

export default NotesTable;
