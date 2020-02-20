import React from 'react';
import './NotesTable.scss';
import { Table, Input, DropdownList, productDropdownItemRenderer } from '../Controls';
import { TableColumn, TableData, MealType } from '../../models';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NotesTableConnected';
import Icon from '../Icon';
import { useParams } from 'react-router-dom';
import { EditNoteSuccessAction, DeleteNoteSuccessAction } from '../../action-types';

interface NotesTableProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  mealType: MealType;
}

const notesTableColumns: TableColumn[] = [
  { name: 'Product', width: '50%' },
  { name: 'Quantity', width: '20%' },
  { name: 'Calories' },
  { name: '', width: '35px' },
  { name: '', width: '35px' },
];

const NotesTable: React.FC<NotesTableProps> = ({
  mealType,
  notesForPageData,
  mealOperationStatuses,
  editableNotesIds,
  productDropdownItems,
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
}: NotesTableProps) => {
  const { id: pageIdFromParams } = useParams();
  const pageId = pageIdFromParams && !isNaN(+pageIdFromParams) ? +pageIdFromParams : 0;

  const currentMealOperationStatus = mealOperationStatuses.filter(os => os.mealType === mealType)[0];
  const isOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;

  const mapNotesToTableData = (): TableData[][] => {
    const notesTableData: TableData[][] = [];

    const handleProductDropdownItemChange = (): void => {
      return;
    };

    const handleProductQuantityChange = (): void => {
      return;
    };

    if (notesForPageData) {
      const meal = notesForPageData.meals.find(m => m.type === mealType);

      if (meal) {
        meal.notes.forEach(note => {
          const isNoteEditable = editableNotesIds.find(id => id === note.id) !== undefined;

          const handleEditIconClick = (): void => {
            setEditableForNote(note.id, true);
          };

          const handleConfirmEditIconClick = async (): Promise<void> => {
            const editNoteAction = await editNote({
              id: note.id,
              mealType,
              productId: 0,
              pageId,
              productQuantity: 0,
            });
            if (editNoteAction as EditNoteSuccessAction) {
              setEditableForNote(note.id, false);
              await getNotesForMeal({ pageId, mealType });
            }
          };

          const handleDeleteIconClick = async (): Promise<void> => {
            const isDeleteConfirmed = window.confirm('Do you want to delete note?');
            if (isDeleteConfirmed) {
              const deleteNoteAction = await deleteNote([note.id, mealType]);
              if (deleteNoteAction as DeleteNoteSuccessAction) {
                await getNotesForMeal({ pageId, mealType });
              }
            }
          };

          const handleCancelEditIconClick = (): void => {
            setEditableForNote(note.id, false);
          };

          const productNameColumnContent = isNoteEditable ? (
            <DropdownList
              items={productDropdownItems}
              itemRenderer={productDropdownItemRenderer}
              togglerSize="small"
              onValueChanged={handleProductDropdownItemChange}
              initialSelectedIndex={productDropdownItems.findIndex(p => p.name === note.productName)}
            ></DropdownList>
          ) : (
            note.productName
          );

          const productQuantityColumnContent = isNoteEditable ? (
            <Input
              type="number"
              controlSize="small"
              value={note.productQuantity}
              onChange={handleProductQuantityChange}
            ></Input>
          ) : (
            note.productQuantity
          );

          const caloriesColumnContent = isNoteEditable ? <React.Fragment></React.Fragment> : note.calories;

          const editControlColumnContent = (
            <Icon
              type={isNoteEditable ? 'check' : 'edit'}
              size="small"
              disabled={isOperationInProcess}
              onClick={isNoteEditable ? handleConfirmEditIconClick : handleEditIconClick}
            ></Icon>
          );

          const deleteControlColumnContent = (
            <Icon
              type="close"
              size="small"
              disabled={isOperationInProcess}
              onClick={isNoteEditable ? handleCancelEditIconClick : handleDeleteIconClick}
            ></Icon>
          );

          notesTableData.push([
            { content: productNameColumnContent },
            { content: productQuantityColumnContent },
            { content: caloriesColumnContent },
            { content: editControlColumnContent },
            { content: deleteControlColumnContent },
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
