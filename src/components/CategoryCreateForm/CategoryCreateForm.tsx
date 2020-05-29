import React, { useState } from 'react';
import './CategoryCreateForm.scss';
import { CategoryCreateFormDispatchToPropsMapResult } from './CategoryCreateFormConnected';
import { FormGroup, Label, Input, Button } from '../Controls';
import { useCategoryValidation } from '../../hooks';
import { ModalButtons } from '../ModalBlocks';

type CategoryCreateFormProps = CategoryCreateFormDispatchToPropsMapResult;

const CategoryCreateForm: React.FC<CategoryCreateFormProps> = ({
  closeModal,
  createCategory,
  getCategories,
}: CategoryCreateFormProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [isCategoryNameValid] = useCategoryValidation(categoryName);

  const handleCategoryNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCategoryName(event.target.value);
  };

  const handleCreateClick = async (): Promise<void> => {
    closeModal();
    await createCategory({ name: categoryName });
    await getCategories();
  };

  const handleCancelClick = (): void => {
    closeModal();
  };

  return (
    <React.Fragment>
      <FormGroup>
        <Label>Category name</Label>
        <Input type="text" placeholder="Category name" value={categoryName} onChange={handleCategoryNameChange}></Input>
      </FormGroup>
      <ModalButtons>
        <Button onClick={handleCreateClick} disabled={!isCategoryNameValid}>
          Create
        </Button>
        <Button onClick={handleCancelClick}>Cancel</Button>
      </ModalButtons>
    </React.Fragment>
  );
};

export default CategoryCreateForm;
