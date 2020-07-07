import React, { useState } from 'react';
import './NoteInput.scss';
import { NoteInputStateToPropsMapResult, NoteInputDispatchToPropsMapResult } from './NoteInputConnected';
import { MealType, NoteItem } from '../../models';
import { NotesOperationsActionTypes } from '../../action-types';
import { useDebounce, useNoteValidation, useFocus } from '../../hooks';
import { Label, Input, Button, productDropdownItemRenderer, DropdownList, Container } from '../__ui__';

const emptyNote: NoteItem = {
  id: 0,
  mealType: MealType.Breakfast,
  displayOrder: 0,
  productId: 0,
  productName: '',
  productQuantity: 100,
  calories: 0,
};

interface NoteInputProps extends NoteInputStateToPropsMapResult, NoteInputDispatchToPropsMapResult {
  note?: NoteItem;
  mealType: MealType;
  pageId: number;
}

const NoteInput: React.FC<NoteInputProps> = ({
  note = emptyNote,
  mealType,
  pageId,
  productDropdownItems,
  noteItems,
  productDropdownItemsFetchState,
  pagesFilter,
  closeModal,
  createNote,
  editNote,
  getNotesForMeal,
  getProductDropdownItems,
  getPages,
}: NoteInputProps) => {
  const [productId, setProductId] = useState(note.productId);
  const [productNameInputValue, setProductNameInputValue] = useState(note.productName);
  const [productQuantity, setProductQuantity] = useState(note.productQuantity);
  const [isProductNameValid, isProductQuantityValid] = useNoteValidation(productNameInputValue, productQuantity);
  const elementToFocusRef = useFocus<HTMLInputElement>();

  const productNameChangeDebounce = useDebounce((newProductName?: string) => {
    getProductDropdownItems({
      productNameFilter: newProductName,
    });
  });

  const {
    loading: isProductDropdownContentLoading,
    loadingMessage: productDropdownContentLoadingMessage,
    error: productDropdownContentErrorMessage,
  } = productDropdownItemsFetchState;

  const isSubmitButtonDisabled = !isProductNameValid || !isProductQuantityValid;
  const isNoteEditable = note !== emptyNote;

  const refreshMealNotesWithPagesAsync = async (): Promise<void> => {
    await getNotesForMeal({
      pageId,
      mealType,
    });
    await getPages(pagesFilter);
  };

  const handleProductDropdownItemSelect = (newSelectedProductIndex: number): void => {
    setProductId(productDropdownItems[newSelectedProductIndex].id);
    setProductNameInputValue(productDropdownItems[newSelectedProductIndex].name);
  };

  const handleProductNameDropdownInputChange = (newProductNameInputValue: string): void => {
    setProductNameInputValue(newProductNameInputValue);
    productNameChangeDebounce(newProductNameInputValue);
  };

  const handleQuantityValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    const quantityValue = isNaN(+target.value) ? 0 : +target.value;
    setProductQuantity(quantityValue);
  };

  const handleAddButtonClick = async (): Promise<void> => {
    const noteItemsForThisMeal = noteItems.filter(n => n.mealType === mealType);
    const lastNoteDisplayOrder =
      noteItemsForThisMeal.length > 0 ? noteItemsForThisMeal[noteItemsForThisMeal.length - 1].displayOrder : -1;

    closeModal();

    const createNoteAction = await createNote({
      mealType,
      productId,
      productQuantity,
      pageId,
      displayOrder: lastNoteDisplayOrder + 1,
    });

    if (createNoteAction.type === NotesOperationsActionTypes.CreateSuccess) {
      await refreshMealNotesWithPagesAsync();
    }
  };

  const handleConfirmButtonClick = async (): Promise<void> => {
    closeModal();

    const editNoteAction = await editNote({
      id: note.id,
      note: {
        mealType,
        productId,
        productQuantity,
        pageId,
        displayOrder: note.displayOrder,
      },
    });

    if (editNoteAction.type === NotesOperationsActionTypes.EditSuccess) {
      await refreshMealNotesWithPagesAsync();
    }
  };

  const handleCancelButtonClick = (): void => {
    closeModal();
  };

  const handleProductDropdownContentOpen = (): void => {
    getProductDropdownItems({
      productNameFilter: productNameInputValue,
    });
  };

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <Container col="4" direction="column">
        <Label>Product</Label>
        <DropdownList
          items={productDropdownItems}
          itemRenderer={productDropdownItemRenderer}
          placeholder="Select product"
          searchable={true}
          inputValue={productNameInputValue}
          isContentLoading={isProductDropdownContentLoading}
          contentLoadingMessage={productDropdownContentLoadingMessage}
          contentErrorMessage={productDropdownContentErrorMessage}
          onValueSelect={handleProductDropdownItemSelect}
          onInputValueChange={handleProductNameDropdownInputChange}
          onContentOpen={handleProductDropdownContentOpen}
        ></DropdownList>
      </Container>
      <Container col="2" direction="column">
        <Label>Quantity, g</Label>
        <Input
          type="number"
          placeholder="Enter quantity"
          value={productQuantity}
          onChange={handleQuantityValueChange}
        ></Input>
      </Container>
      <Container col="6">
        <Container col="12" justify="flex-end" spaceBetweenChildren="medium">
          <Container col="4">
            {isNoteEditable ? (
              <Button onClick={handleConfirmButtonClick} disabled={isSubmitButtonDisabled}>
                Save
              </Button>
            ) : (
              <Button onClick={handleAddButtonClick} disabled={isSubmitButtonDisabled}>
                Add
              </Button>
            )}
          </Container>
          <Container col="4">
            <Button inputRef={elementToFocusRef} variant="text" onClick={handleCancelButtonClick}>
              Cancel
            </Button>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default NoteInput;
