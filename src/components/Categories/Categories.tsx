import React from 'react';
import './Categories.scss';
import { ContentWrapper, MainContainer, SectionContainer } from '../ContainerBlocks';
import Sidebar from '../Sidebar';

const Categories: React.FC = () => {
  return (
    <ContentWrapper>
      <Sidebar>Categories sidebar</Sidebar>
      <MainContainer withSidebar>
        <SectionContainer>Categories content</SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Categories;
