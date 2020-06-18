import React, { useState } from 'react';
import './CategoryCreateForm.scss';
import { CategoryCreateFormDispatchToPropsMapResult } from './CategoryCreateFormConnected';
import { Label, Input, Button, Container } from '../__ui__';
import { useCategoryValidation } from '../../hooks';

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
    <Container direction="column" spaceBetweenChildren="large">
      <Container direction="column">
        <Label>Category name</Label>
        <Input type="text" placeholder="Category name" value={categoryName} onChange={handleCategoryNameChange}></Input>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button onClick={handleCreateClick} disabled={!isCategoryNameValid}>
            Create
          </Button>
        </Container>
        <Container col="4">
          <Button onClick={handleCancelClick}>Cancel</Button>
        </Container>
      </Container>
    </Container>
  );
};

export default CategoryCreateForm;
