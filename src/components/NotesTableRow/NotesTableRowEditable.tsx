import React, { useState } from 'react';
import { DropdownList, Input, productDropdownItemRenderer } from '../Controls';
import Icon from '../Icon';
import {
  NotesTableRowEditableStateToPropsMapResult,
  NotesTableRowEditableDispatchToPropsMapResult,
} from './NotesTableRowEditableConnected';
import { NoteItem } from '../../models';
import { useNoteValidation, useDebounce, useNoteInputDisabled, useIdFromRoute } from '../../hooks';
import { NotesOperationsActionTypes } from '../../action-types';

interface NotesTableRowEditableProps
  extends NotesTableRowEditableStateToPropsMapResult,
    NotesTableRowEditableDispatchToPropsMapResult {
  note: NoteItem;
}

const NotesTableRowEditable: React.FC<NotesTableRowEditableProps> = ({
  note,
  productDropdownItems,
  productDropdownItemsFetchState,
  mealOperationStatuses,
  isPageOperationInProcess,
  pagesFilter,
  editNote,
  getProductDropdownItems,
  setEditableForNote,
  getNotesForMeal,
  getPages,
}: NotesTableRowEditableProps) => {
  const [productId, setProductId] = useState(note.productId);
  const [productNameInputValue, setProductNameInputValue] = useState(note.productName);
  const [productQuantity, setProductQuantity] = useState(note.productQuantity);
  const [isProductNameValid, isProductQuantityValid] = useNoteValidation(productNameInputValue, productQuantity);

  const pageId = useIdFromRoute();
  const isNoteInputDisabled = useNoteInputDisabled(mealOperationStatuses, note.mealType, isPageOperationInProcess);

  const productNameChangeDebounce = useDebounce(() => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
  });

  const {
    loading: isProductDropdownContentLoading,
    loadingMessage: productDropdownContentLoadingMessage,
    error: productDropdownContentErrorMessage,
  } = productDropdownItemsFetchState;

  const isConfirmEditIconDisabled = isNoteInputDisabled || !isProductQuantityValid || !isProductNameValid;

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

  const handleConfirmEditIconClick = async (): Promise<void> => {
    const { type: editNoteActionType } = await editNote({
      id: note.id,
      note: {
        mealType: note.mealType,
        productId,
        pageId,
        productQuantity,
        displayOrder: note.displayOrder,
      },
    });

    if (editNoteActionType === NotesOperationsActionTypes.EditSuccess) {
      setEditableForNote(note.id, false);
      await getNotesForMeal({
        pageId,
        mealType: note.mealType,
      });
      await getPages(pagesFilter);
    }
  };

  const handleCancelEditIconClick = (): void => {
    setEditableForNote(note.id, false);
  };

  const handleProductDropdownContentOpen = (): void => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
  };

  return (
    <tr>
      <td>
        <DropdownList
          items={productDropdownItems}
          itemRenderer={productDropdownItemRenderer}
          placeholder="Select product"
          searchable={true}
          controlSize="small"
          inputValue={productNameInputValue}
          isContentLoading={isProductDropdownContentLoading}
          contentLoadingMessage={productDropdownContentLoadingMessage}
          contentErrorMessage={productDropdownContentErrorMessage}
          disabled={isNoteInputDisabled}
          onValueSelect={handleProductDropdownItemSelect}
          onInputValueChange={handleProductNameDropdownInputChange}
          onContentOpen={handleProductDropdownContentOpen}
        ></DropdownList>
      </td>
      <td>
        <Input
          type="number"
          controlSize="small"
          value={productQuantity}
          onChange={handleProductQuantityChange}
          disabled={isNoteInputDisabled}
        ></Input>
      </td>
      <td></td>
      <td>
        <Icon
          type="check"
          size="small"
          disabled={isConfirmEditIconDisabled}
          onClick={handleConfirmEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon type="close" size="small" disabled={isNoteInputDisabled} onClick={handleCancelEditIconClick}></Icon>
      </td>
    </tr>
  );
};

export default NotesTableRowEditable;
