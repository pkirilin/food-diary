import React from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../action-creators';
import { useFocus, useInput } from '../../hooks';
import { CategoryCreateEdit } from '../../models';
import { Button, Container, Input, Label } from '../__ui__';

export type CategoryInputProps = {
  category?: CategoryCreateEdit;
  onSubmit: (newCategory: CategoryCreateEdit) => void;
};

export const CategoryInput: React.FC<CategoryInputProps> = ({ category, onSubmit }: CategoryInputProps) => {
  const categoryName = useInput<string>(category?.name || '', value => value.length >= 4 && value.length <= 64);
  const elementToFocusRef = useFocus<HTMLInputElement>();
  const dispatch = useDispatch();

  const handleSubmit = (): void => {
    dispatch(closeModal());
    onSubmit({ name: categoryName.value });
  };

  const handleCancel = (): void => {
    dispatch(closeModal());
  };

  return (
    <Container direction="column" spaceBetweenChildren="large">
      <Container direction="column">
        <Label>Category name</Label>
        <Input inputRef={elementToFocusRef} type="text" placeholder="Category name" {...categoryName.binding}></Input>
      </Container>
      <Container justify="flex-end" spaceBetweenChildren="medium">
        <Container col="4">
          <Button onClick={handleSubmit} disabled={!categoryName.isValid}>
            {category ? 'Save' : 'Create'}
          </Button>
        </Container>
        <Container col="4">
          <Button variant="text" onClick={handleCancel}>
            Cancel
          </Button>
        </Container>
      </Container>
    </Container>
  );
};
