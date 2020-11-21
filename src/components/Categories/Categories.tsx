import React from 'react';
import { useDispatch } from 'react-redux';
import { useModalMessage } from '../../hooks';
import { Button, Container } from '../__ui__';
import { createCategory, openModal } from '../../action-creators';
import CategoriesTable from '../CategoriesTable';
import CategoryInput from '../CategoryInput';

const Categories: React.FC = () => {
  useModalMessage('Error', state => state.categories.operations.status.error);

  const dispatch = useDispatch();

  const handleCreateCategory = (): void => {
    dispatch(
      openModal(
        'New category',
        <CategoryInput
          onSubmit={(newCategory): void => {
            dispatch(createCategory(newCategory));
          }}
        ></CategoryInput>,
        { width: '35%' },
      ),
    );
  };

  return (
    <main>
      <section>
        <Container direction="column" spaceBetweenChildren="medium">
          <Container justify="space-between" align="center" spaceBetweenChildren="medium">
            <h1>Categories</h1>
            <Container>
              <Button onClick={handleCreateCategory}>Create category</Button>
            </Container>
          </Container>
          <CategoriesTable></CategoriesTable>
        </Container>
      </section>
    </main>
  );
};

export default Categories;
