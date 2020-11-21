import React from 'react';
import { useModalMessage } from '../../hooks';
import { Button, Container } from '../__ui__';
import CategoriesTable from '../CategoriesTable';

const Categories: React.FC = () => {
  useModalMessage('Error', state => state.categories.operations.status.error);

  return (
    <React.Fragment>
      <main>
        <section>
          <Container direction="column" spaceBetweenChildren="medium">
            <Container justify="space-between" align="center" spaceBetweenChildren="medium">
              <h1>Categories</h1>
              <Container>
                <Button>Create category</Button>
              </Container>
            </Container>
            <CategoriesTable></CategoriesTable>
          </Container>
        </section>
      </main>
    </React.Fragment>
  );
};

export default Categories;
