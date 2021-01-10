import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { NoteItem } from '../models';

type NotesTableRowProps = {
  note: NoteItem;
};

const NotesTableRow: React.FC<NotesTableRowProps> = ({ note }: NotesTableRowProps) => {
  return (
    <TableRow>
      <TableCell>{note.productName}</TableCell>
      <TableCell>{note.productQuantity}</TableCell>
      <TableCell>{note.calories}</TableCell>
    </TableRow>
  );
};

export default NotesTableRow;
