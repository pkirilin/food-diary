import React from 'react';
import { Container } from '../__ui__';

const PageContentEmpty: React.FC = () => {
  return (
    <Container justify="center" isSectionRoot={true}>
      <Container direction="column" justify="center" align="center" textColor="middle-green-50">
        No page selected
      </Container>
    </Container>
  );
};

export default PageContentEmpty;
