import React from 'react';
import './NotesTable.scss';
import { Table } from '../Controls';
import { TableColumn, TableData, MealType } from '../../models';
import { StateToPropsMapResult } from './NotesTableConnected';
import Icon from '../Icon';

interface NotesTableProps extends StateToPropsMapResult {
  mealType: MealType;
}

const notesTableColumns: TableColumn[] = [
  { name: 'Product' },
  { name: 'Quantity' },
  { name: 'Calories' },
  { name: '', width: '35px' },
  { name: '', width: '35px' },
];

const NotesTable: React.FC<NotesTableProps> = ({
  mealType,
  notesForPageData,
  mealOperationStatuses,
}: NotesTableProps) => {
  const currentMealOperationStatus = mealOperationStatuses.filter(os => os.mealType === mealType)[0];
  const isOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;

  const mapNotesToTableData = (): TableData[][] => {
    const notesTableData: TableData[][] = [];

    if (notesForPageData) {
      const meal = notesForPageData.meals.find(m => m.type === mealType);

      if (meal) {
        meal.notes.forEach(note => {
          notesTableData.push([
            { content: note.productName },
            { content: note.productQuantity },
            { content: note.calories },
            { content: <Icon type="edit" size="small" disabled={isOperationInProcess}></Icon> },
            { content: <Icon type="close" size="small" disabled={isOperationInProcess}></Icon> },
          ]);
        });
      }
    }

    return notesTableData;
  };

  return (
    <div className="notes-table">
      <Table columns={notesTableColumns} data={mapNotesToTableData()}></Table>
    </div>
  );
};

export default NotesTable;
