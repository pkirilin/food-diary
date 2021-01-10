import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
    </TableContainer>
  );
};

export default NotesTable;
