import React from 'react';
import './NotesTable.scss';
import { MealType } from '../../models';
import { StateToPropsMapResult } from './NotesTableConnected';
import { Table, TableColumn } from '../Controls';
import NotesTableRowConnected from '../NotesTableRow';

interface NotesTableProps extends StateToPropsMapResult {
  mealType: MealType;
}

const notesTableColumns = [
  <TableColumn key="Product" name="Product" width="50%"></TableColumn>,
  <TableColumn key="Quantity" name="Quantity" width="20%"></TableColumn>,
  <TableColumn key="Calories" name="Calories"></TableColumn>,
  <TableColumn key="Edit" name="" width="35px"></TableColumn>,
  <TableColumn key="Delete" name="" width="35px"></TableColumn>,
];

const NotesTable: React.FC<NotesTableProps> = ({ mealType, mealItemsWithNotes }: NotesTableProps) => {
  const mapNoteItemsToTableRows = (): JSX.Element[] => {
    const rows: JSX.Element[] = [];

    const meal = mealItemsWithNotes.find(m => m.type === mealType);
    if (meal) {
      meal.notes.forEach(note => {
        rows.push(<NotesTableRowConnected mealType={mealType} note={note}></NotesTableRowConnected>);
      });
    }

    return rows;
  };

  return (
    <div className="notes-table">
      <Table columns={notesTableColumns} rows={mapNoteItemsToTableRows()}></Table>
    </div>
  );
};

export default NotesTable;
