import React, { useState } from 'react';
import './NotesTableRow.scss';
import { MealType, NoteItem } from '../../models';
import { productDropdownItemRenderer, Input, DropdownList } from '../Controls';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NotesTableRowConnected';
import Icon from '../Icon';
import { EditNoteSuccessAction, DeleteNoteSuccessAction } from '../../action-types';
import { useParams } from 'react-router-dom';

interface NotesTableRowProps extends StateToPropsMapResult, DispatchToPropsMapResult {
  mealType: MealType;
  note: NoteItem;
}

const NotesTableRow: React.FC<NotesTableRowProps> = ({
  mealType,
  note,
  productDropdownItems,
  editableNotesIds,
  mealOperationStatuses,
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
}: NotesTableRowProps) => {
  const initialSelectedProductName = productDropdownItems.find(p => p.id === note.productId)?.name;

  const [productId, setProductId] = useState(note.productId);
  const [productNameInputValue, setProductNameInputValue] = useState(initialSelectedProductName);
  const [productQuantity, setProductQuantity] = useState(100);

  const { id: pageIdFromParams } = useParams();
  const pageId = pageIdFromParams && !isNaN(+pageIdFromParams) ? +pageIdFromParams : 0;

  const currentMealOperationStatus = mealOperationStatuses.find(s => s.mealType === mealType);

  const isNoteEditable = editableNotesIds.find(id => id === note.id) !== undefined;
  const isOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;

  const handleProductDropdownItemSelect = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setProductNameInputValue(productDropdownItems[newSelectedProductIndex].name);
  };

  const handleProductQuantityChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleEditIconClick = (): void => {
    setEditableForNote(note.id, true);
  };

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const editNoteAction = await editNote({
      id: note.id,
      mealType,
      productId,
      pageId,
      productQuantity,
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

  return (
    <tr>
      <td>
        {isNoteEditable ? (
          <DropdownList
            items={productDropdownItems}
            itemRenderer={productDropdownItemRenderer}
            placeholder="Select product"
            searchable={true}
            controlSize="small"
            inputValue={productNameInputValue}
            onValueSelect={handleProductDropdownItemSelect}
          ></DropdownList>
        ) : (
          note.productName
        )}
      </td>
      <td>
        {isNoteEditable ? (
          <Input
            type="number"
            controlSize="small"
            value={productQuantity}
            onChange={handleProductQuantityChange}
          ></Input>
        ) : (
          productQuantity
        )}
      </td>
      <td>{!isNoteEditable && note.calories}</td>
      <td>
        <Icon
          type={isNoteEditable ? 'check' : 'edit'}
          size="small"
          disabled={isOperationInProcess}
          onClick={isNoteEditable ? handleConfirmEditIconClick : handleEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          disabled={isOperationInProcess}
          onClick={isNoteEditable ? handleCancelEditIconClick : handleDeleteIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default NotesTableRow;
