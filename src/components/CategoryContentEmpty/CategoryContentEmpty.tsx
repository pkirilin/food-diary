import React from 'react';
import { Container } from '../__ui__';

const CategoryContentEmpty: React.FC = () => {
  return (
    <Container justify="center" isSectionRoot={true}>
      <Container direction="column" justify="center" align="center" textColor="middle-green-50">
        No category selected
      </Container>
    </Container>
  );
};

export default CategoryContentEmpty;
