import React, { useState } from 'react';
import './NotesTableRow.scss';
import { MealType, NoteItem } from '../../models';
import { productDropdownItemRenderer, Input, DropdownList } from '../Controls';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './NotesTableRowConnected';
import Icon from '../Icon';
import { EditNoteSuccessAction, DeleteNoteSuccessAction } from '../../action-types';
import { useParams } from 'react-router-dom';
import { useDebounce, useNoteValidation } from '../../hooks';

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
  isProductDropdownContentLoading,
  isPageOperationInProcess,
  setEditableForNote,
  editNote,
  deleteNote,
  getNotesForMeal,
  getProductDropdownItems,
}: NotesTableRowProps) => {
  const [productId, setProductId] = useState(note.productId);
  const [productNameInputValue, setProductNameInputValue] = useState(note.productName);
  const [productQuantity, setProductQuantity] = useState(note.productQuantity);
  const [isProductNameValid, isProductQuantityValid] = useNoteValidation(productNameInputValue, productQuantity);

  const productNameChangeDebounce = useDebounce(() => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
  });

  const { id: pageIdFromParams } = useParams();
  const pageId = pageIdFromParams && !isNaN(+pageIdFromParams) ? +pageIdFromParams : 0;

  const currentMealOperationStatus = mealOperationStatuses.find(s => s.mealType === mealType);

  const isNoteEditable = editableNotesIds.find(id => id === note.id) !== undefined;
  const isMealOperationInProcess = currentMealOperationStatus && currentMealOperationStatus.performing;
  const isInputDisabled = isMealOperationInProcess || isPageOperationInProcess;
  const isConfirmEditIconDisabled = isInputDisabled || !isProductQuantityValid || !isProductNameValid;

  const handleProductDropdownItemSelect = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setProductNameInputValue(productDropdownItems[newSelectedProductIndex].name);
  };

  const handleProductNameDropdownInputChange = (newProductNameInputValue: string): void => {
    setProductNameInputValue(newProductNameInputValue);
    productNameChangeDebounce();
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
      displayOrder: note.displayOrder,
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
    setProductId(note.productId);
    setProductNameInputValue(note.productName);
    setProductQuantity(note.productQuantity);
  };

  const handleProductDropdownContentOpen = (): void => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
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
            isContentLoading={isProductDropdownContentLoading}
            disabled={isInputDisabled}
            onValueSelect={handleProductDropdownItemSelect}
            onInputValueChange={handleProductNameDropdownInputChange}
            onContentOpen={handleProductDropdownContentOpen}
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
            disabled={isInputDisabled}
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
          disabled={isNoteEditable ? isConfirmEditIconDisabled : isInputDisabled}
          onClick={isNoteEditable ? handleConfirmEditIconClick : handleEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          disabled={isInputDisabled}
          onClick={isNoteEditable ? handleCancelEditIconClick : handleDeleteIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default NotesTableRow;
